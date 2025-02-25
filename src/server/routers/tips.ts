import {z} from 'zod'
import slugify from '@sindresorhus/slugify'
import {customAlphabet} from 'nanoid'
import {groupBy} from 'lodash'
import {v4} from 'uuid'
import {inngest} from 'utils/inngest.server'
import {baseProcedure, router} from '../trpc'
import {sanityWriteClient} from 'utils/sanity-server'
import {getAllTips, getTip, getCoursesRelatedToTip, TipSchema} from 'lib/tips'
import {getAbilityFromToken} from 'server/ability'

export const tipsRouter = router({
  create: baseProcedure
    .input(
      z.object({
        s3Url: z.string(),
        fileName: z.string().nullable(),
        title: z.string(),
      }),
    )
    .mutation(async ({ctx, input}) => {
      // create a video resource, which should trigger the process of uploading to
      // mux and ordering a transcript because of the active webhook
      const ability = await getAbilityFromToken(ctx?.userToken)

      // use CASL rbac to check if the user can create content
      if (ability.can('create', 'Content')) {
        // create the video resource object in Sanity
        const newVideoResource = await sanityWriteClient.create({
          _id: `videoResource-${v4()}`,
          _type: 'videoResource',
          state: 'new',
          title: input.fileName,
          originalMediaUrl: input.s3Url,
        })

        if (newVideoResource._id) {
          // control the id that is used so we can reference it immediately
          const id = v4()

          const nanoid = customAlphabet(
            '1234567890abcdefghijklmnopqrstuvwxyz',
            5,
          )

          // create the Tip resource in sanity with the video resource attached
          const tipResource = await sanityWriteClient.create({
            _id: `tip-${id}`,
            _type: 'tip',
            state: 'new',
            title: input.title,
            slug: {
              // since title is unique, we can use it as the slug with a random string
              current: `${slugify(input.title)}~${nanoid()}`,
            },
            resources: [
              {
                _key: v4(),
                _type: 'reference',
                _ref: newVideoResource._id,
              },
            ],
          })

          // load the complete tip from sanity so we can return it
          // we are reloading it because the query for `getTip` "normalizes"
          // the data and that's what we expect client-side
          const tip = await getTip(tipResource.slug.current)

          if (tip) {
            await inngest.send({
              name: 'tip/video.uploaded',
              data: {
                tipId: tip._id,
                videoResourceId: newVideoResource._id,
              },
            })
          }

          return tip
        } else {
          throw new Error('Could not create video resource')
        }
      } else {
        throw new Error('Unauthorized')
      }
    }),
  update: baseProcedure
    .input(
      z.object({
        slug: z.string(),
        body: z.string().optional().nullable(),
        title: z.string().optional(),
        _id: z.string(),
      }),
    )
    .mutation(async ({ctx, input}) => {
      const ability = await getAbilityFromToken(ctx?.userToken)

      if (ability.can('create', 'Content')) {
        const tip = await sanityWriteClient
          .patch(input._id)
          .set({
            title: input.title,
            body: input.body,
            slug: {
              current: input.slug,
            },
          })
          .commit()
        return await getTip(tip.slug.current)
      }

      throw new Error('Unauthorized')
    }),

  all: baseProcedure
    .input(
      z
        .object({
          grouped: z.boolean().optional(),
        })
        .optional(),
    )
    .query(async ({input}) => {
      const tips = await getAllTips(false)

      const tipGroups = groupBy(tips, 'state')
      const tipGroupsArray = Object.entries(tipGroups).map(([key, value]) => {
        return {state: key, tips: value.map((t) => TipSchema.parse(t))}
      })
      return tipGroupsArray.reverse()
    }),
  bySlug: baseProcedure
    .input(
      z.object({
        slug: z.string(),
      }),
    )
    .query(async ({ctx, input}) => {
      const lesson = await getTip(input.slug)

      if (!lesson) {
        throw new Error('Could not find lesson')
      }

      return lesson
    }),
  relatedContent: baseProcedure
    .input(
      z.object({
        slug: z.string(),
      }),
    )
    .query(async ({ctx, input}) => {
      const lesson = await getCoursesRelatedToTip(input.slug)

      return lesson
    }),
})
