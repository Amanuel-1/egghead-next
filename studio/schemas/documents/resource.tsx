import {MdKitchen as icon} from 'react-icons/md'
import * as React from 'react'
import PathInput from '../components/path-input'
import {defineArrayMember, defineField, defineType} from 'sanity'

export default defineType({
  name: 'resource',
  title: 'Resource',
  description: 'Almost anything, really.',
  type: 'document',
  icon,
  fieldsets: [
    {
      name: 'relatedContent',
      title: 'Related Content',
      description: 'Usually you want to add to resources, but sometimes not.',
      options: {
        collapsible: true,
        collapsed: false,
      },
    },
    {
      name: 'source',
      title: 'Source',
      description: 'describe where this came from',
      options: {
        collapsible: true,
        collapsed: false,
      },
    },
  ],
  fields: [
    defineField({
      name: 'title',
      description: 'the H1',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required().max(90),
    }),
    defineField({
      name: 'name',
      description:
        'Usually internal, but not always. Maybe for a collection or landing page.',
      title: 'Code Name',
      type: 'string',
      validation: (Rule) => Rule.max(90),
    }),
    defineField({
      name: 'updatedAt',
      description: 'The last time this resource was meaningfully updated',
      title: 'Updated At',
      type: 'date',
    }),
    // {
    //   name: 'tags',
    //   title: 'Tags',
    //   type: 'tags',
    //   description: 'an arbitrary set of global tags',
    // },
    defineField({
      name: 'type',
      description: 'Resources have types that we can use to distinguish them.',
      title: 'Type',
      type: 'string',
      validation: (Rule) => Rule.required(),
      options: {
        list: [
          {
            title: 'course',
            value: 'course',
          },
          {
            title: 'playlist',
            value: 'playlist',
          },
          {
            title: 'collection',
            value: 'collection',
          },
          {
            title: 'project',
            value: 'project',
          },
          {
            title: 'podcast',
            value: 'podcast',
          },
          {
            title: 'article',
            value: 'article',
          },
          {
            title: 'landing page',
            value: 'landing-page',
          },
          {
            title: 'feature',
            value: 'feature',
          },
          {
            title: 'video (Lesson)',
            value: 'video',
          },
          {
            title: 'podcast',
            value: 'podcast',
          },
          {
            title: 'talk',
            value: 'talk',
          },
          {
            title: 'portfolio',
            value: 'portfolio',
          },
          {
            title: 'club',
            value: 'club',
          },
        ],
      },
    }),
    defineField({
      name: 'displayComponent',
      type: 'string',
      title: 'Display Component',
      description:
        'What component should be used in egghead-next to display this feature?',
      hidden: ({document}) => document?.type !== 'feature',
      options: {
        list: [
          {
            title: 'Dynamic Grid',
            value: 'DynamicGrid',
          },
          {
            title: 'egghead For Teams CTA',
            value: 'eggheadForTeamsCta',
          },
        ],
      },
    }),
    defineField({
      name: 'productionProcessState',
      title: 'Production Process State',
      type: 'productionProcessState',
      hidden: ({document}) => document?.type !== 'course',
      validation: (Rule) =>
        Rule.custom((value, {document}) => {
          if (document?.type === 'course' && value === undefined) {
            return 'You must select a production process state'
          }
          return true
        }).warning(),
    }),
    defineField({
      name: 'challengeRating',
      description: 'How difficult is this?',
      title: 'Challenge Rating',
      type: 'number',
      validation: (Rule) => Rule.min(0).max(10),
      options: {
        list: [
          {
            title: 'rudimentary',
            value: 1,
          },
          {
            title: 'basic',
            value: 1,
          },
          {
            title: 'novice',
            value: 2,
          },
          {
            title: 'beginner',
            value: 3,
          },
          {
            title: 'advanced beginner',
            value: 4,
          },
          {
            title: 'intermediate',
            value: 5,
          },
          {
            title: 'beyond intermediate',
            value: 6,
          },

          {
            title: 'advanced intermediate',
            value: 7,
          },
          {
            title: 'advanced',
            value: 8,
          },
          {
            title: 'extremely advanced',
            value: 9,
          },
          {
            title: 'expert',
            value: 10,
          },
        ],
      },
    }),
    defineField({
      name: 'challengeDescription',
      description: 'Describe the challenge rating tweet-sized.',
      title: 'Challenge Description',
      type: 'markdown',
      validation: (Rule) => Rule.max(160),
      options: {
        maxLength: 160,
      },
    }),
    defineField({
      name: 'externalId',
      fieldset: 'source',
      description: 'Numeric ID in egghead.io database. not a slug.',
      title: 'egghead ID',
      type: 'number',
    }),
    defineField({
      name: 'externalType',
      fieldset: 'source',
      description: 'what type of resource is this in egghead database',
      title: 'External Type',
      type: 'string',
    }),
    defineField({
      name: 'slug',
      description: 'Can generate from title, not used as ID',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 100,
      },
    }),
    defineField({
      name: 'subTitle',
      description: 'Short punchy bit of text.',
      title: 'Sub-Title',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.max(120),
    }),
    defineField({
      name: 'byline',
      description: 'Who is it by?',
      title: 'Byline',
      type: 'string',
      validation: (Rule) => Rule.max(90),
    }),
    defineField({
      name: 'meta',
      description: 'A bit of descriptive text.',
      title: 'Meta',
      type: 'string',
      validation: (Rule) => Rule.max(90),
    }),
    defineField({
      name: 'description',
      description: 'Full description, no limits',
      title: 'Description',
      type: 'markdown',
    }),
    defineField({
      name: 'summary',
      description: 'Short description, like for a tweet',
      title: 'Summary',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.max(180),
    }),
    defineField({
      name: 'content',
      description: 'Various forms of content for this resource.',
      title: 'Content',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'ctaPlug',
        }),
        defineArrayMember({
          type: 'link',
        }),
        defineArrayMember({
          type: 'markdownText',
        }),
        defineArrayMember({
          type: 'string-list',
        }),
      ],
    }),
    defineField({
      name: 'url',
      fieldset: 'source',
      description: 'Full url of this resources (if applicable).',
      title: 'External URL',
      type: 'url',
    }),
    defineField({
      name: 'path',
      fieldset: 'source',
      description: "Path on egghead.io. Don't forget the /",
      title: 'egghead.io/ Path',
      type: 'string',
      // components: {
      //   input: PathInput,
      //   field:
      // }
      // options: {
      //   basePath: 'egghead.io',
      //   formatSlug: false,
      // },
    }),
    defineField({
      name: 'image',
      description: 'Links to a full-sized primary image',
      title: 'Image Url',
      type: 'url',
    }),
    defineField({
      name: 'urls',
      description: 'Links to things.',
      title: 'External URLs',
      type: 'array',
      of: [defineArrayMember({type: 'link'})],
    }),
    defineField({
      name: 'images',
      description: 'Links to image.',
      title: 'Images (URLs)',
      type: 'array',
      of: [defineArrayMember({type: 'image-url'})],
    }),
    defineField({
      name: 'collaborators',
      description:
        'Humans that worked on this resource and get credit for the effort.',
      title: 'Collaborators',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'collaborator'}],
        }),
      ],
    }),
    defineField({
      name: 'features',
      title: 'Features',
      description: 'A list of features (bullet points)',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
    }),
    defineField({
      name: 'softwareLibraries',
      description: 'Versioned Software Libraries',
      title: 'NPM or other Dependencies',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'versioned-software-library',
        }),
      ],
    }),
    defineField({
      name: 'resources',
      description:
        'Arbitrary resources, maybe this is a collection? Internal to this resource (not shared at the top level)',
      title: 'Resources',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'resource',
          title: 'Resource',
        }),
        defineArrayMember({
          type: 'reference',
          title: 'Resources Refs',
          to: [
            {title: 'Course', type: 'course'},
            {title: 'Resource Ref', type: 'resource'},
          ],
        }),
        defineArrayMember({
          type: 'post',
          title: 'Blog Post',
        }),
      ],
    }),
    defineField({
      name: 'projects',
      description: 'Related Project Resources',
      title: 'Projects',
      fieldset: 'relatedContent',
      type: 'array',
      of: [
        defineArrayMember({type: 'link'}),
        defineArrayMember({
          type: 'resource',
          title: 'Resource',
        }),
        defineArrayMember({
          type: 'reference',
          title: 'Resources Refs',
          to: [{type: 'resource'}],
        }),
      ],
    }),
    defineField({
      name: 'essentialQuestions',
      description: 'The important questions.',
      title: 'Essential Questions',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          title: 'Essential Question',
          to: [{type: 'essentialQuestion'}],
        }),
      ],
    }),
    defineField({
      name: 'related',
      description: 'Stuff that pairs well with this resource. Watch next?',
      title: 'Related Resources',
      fieldset: 'relatedContent',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'resource',
          title: 'Resource',
        }),
        defineArrayMember({
          type: 'reference',
          title: 'Resources Refs',
          to: [{type: 'resource'}],
        }),
      ],
    }),
    defineField({
      name: 'prerequisites',
      description: 'Resources that would be good to watch first.',
      title: 'Prerequisite Resources',
      fieldset: 'relatedContent',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'resource',
          title: 'Resource',
        }),
        defineArrayMember({
          type: 'reference',
          title: 'Resources Refs',
          to: [{type: 'resource'}],
        }),
      ],
    }),
    defineField({
      name: 'nextSteps',
      description: 'Resources that would be good to watch next.',
      title: 'Next Step Resources',
      type: 'array',
      fieldset: 'relatedContent',
      of: [
        defineArrayMember({
          type: 'resource',
          title: 'Resource',
        }),
        defineArrayMember({
          type: 'reference',
          title: 'Resources Refs',
          to: [{type: 'resource'}],
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      name: 'name',
      meta: 'meta',
      media: 'previewImage',
      image: 'image',
      type: 'type',
    },
    prepare(selection) {
      const {title, name, type, media, image} = selection

      return {
        title: name || title,
        subtitle: type,
        media: image ? (
          <img src={image} alt={`${title} movie poster`} />
        ) : (
          media
        ),
      }
    },
  },
})
