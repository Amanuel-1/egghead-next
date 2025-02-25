import * as React from 'react'
import groq from 'groq'
import {sanityClient} from 'utils/sanity-client'
import imageUrlBuilder from '@sanity/image-url'
import mdxComponents from 'components/mdx'
import {serialize} from 'next-mdx-remote/serialize'
import {MDXRemote} from 'next-mdx-remote'
import {FunctionComponent} from 'react'
import Image from 'next/legacy/image'
import Link from 'next/link'
import {NextSeo} from 'next-seo'
import {useRouter} from 'next/router'
import CourseWidget from 'components/mdx/course-widget'
import ResourceWidget from 'components/mdx/resource-widget'
import ArticleSeriesList from 'components/mdx/article-series-list'
import find from 'lodash/find'
import {useScrollTracker} from 'react-scroll-tracker'
import analytics from 'utils/analytics'
import EmailSubscribeWidget from 'components/mdx/email-subscribe-widget'
import remarkGfm from 'remark-gfm'

function urlFor(source: any): any {
  return imageUrlBuilder(sanityClient).image(source)
}

const Tag = (props: any) => {
  const [hiddenCTA, setHiddenCTA] = React.useState(false)
  const {
    title = 'Missing title',
    categories,
    author = {name: 'Unknown Author'},
    seo: originalSEO = {},
    coverImage,
    source,
    articleResources,
    resources,
    slug,
  } = props

  const seo = originalSEO ? originalSEO : {}

  const router = useRouter()

  const url = process.env.NEXT_PUBLIC_DEPLOYMENT_URL + router.asPath
  const canonicalUrl = seo?.canonicalUrl ? seo.canonicalUrl : url

  const defaultOgImage: string | undefined = title
    ? `https://og-image-react-egghead.now.sh/article/${encodeURIComponent(
        title,
      )}?author=${encodeURIComponent(author.name)}&theme=dark`
    : undefined

  const ogImage = seo.ogImage ? seo.ogImage : defaultOgImage

  const {scrollY} = useScrollTracker([10, 25, 50, 75, 100])

  React.useEffect(() => {
    if (scrollY > 0) {
      analytics.events.engagementReadArticle(router.asPath, scrollY)
    }
  }, [scrollY])

  return (
    <>
      <NextSeo
        title={title}
        description={seo.description}
        openGraph={{
          title: seo.ogTitle || title,
          description: seo.ogDescription,
          url,
          images: [
            {
              url: ogImage,
              alt: title,
            },
          ],
        }}
        twitter={{
          cardType: seo.cardType || 'summary_large_image',
          site: seo.site || 'eggheadio',
          handle: seo.handle,
        }}
        canonical={canonicalUrl}
      />
      <div className="container">
        <article className="max-w-screen-md mx-auto mt-10 mb-16 lg:mt-24 md:mt-20">
          <header>
            <h1 className="w-full max-w-screen-md mb-8 text-3xl font-extrabold lg:text-6xl md:text-5xl sm:text-4xl lg:mb-10 leading-tighter">
              {title}
            </h1>
            {author && <Author author={author} />}
            {coverImage?.url && (
              <div className="mt-4">
                <Image
                  src={coverImage.url}
                  alt={coverImage.alt || title}
                  width={1280}
                  height={720}
                  quality={100}
                  className="rounded-lg"
                />
              </div>
            )}
          </header>
          <main className="prose dark:prose-dark sm:prose-lg lg:prose-xl max-w-none dark:prose-a:text-blue-300 prose-a:text-blue-500">
            <MDXRemote
              {...source}
              components={{
                ...mdxComponents,
                CourseWidget: ({course: courseSlug, ...props}: any) => {
                  const course = find(resources, {slug: courseSlug})
                  return course ? (
                    <div className="not-prose my-8">
                      <CourseWidget course={course} {...props} />
                    </div>
                  ) : null
                },
                ResourceWidget: ({resource: resourceSlug, ...props}: any) => {
                  const resource = find(articleResources, {slug: resourceSlug})
                  return resource ? (
                    <div className="not-prose my-8">
                      <ResourceWidget
                        resource={resource}
                        location={resource.location}
                        {...props}
                      />
                    </div>
                  ) : null
                },
                ArticleSeriesList: ({
                  resource: resourceSlug,
                  ...props
                }: any) => {
                  const resource = find(articleResources, {slug: resourceSlug})
                  return resource ? (
                    <div className="not-prose my-8">
                      <ArticleSeriesList
                        resource={resource}
                        location={resource.location}
                        {...props}
                      />
                    </div>
                  ) : null
                },
                EmailSubscribeWidget: (props: any) => {
                  return (
                    <div className="not-prose my-8">
                      <EmailSubscribeWidget
                        slug={slug}
                        author={author}
                        hideCTAState={[hiddenCTA, setHiddenCTA]}
                      />
                    </div>
                  )
                },
              }}
            />
          </main>
        </article>
      </div>
    </>
  )
}

const Author: FunctionComponent<
  React.PropsWithChildren<{
    author: {
      name: string
      image?: any
      path?: string
    }
  }>
> = ({author}) => {
  const {name, image, path} = author
  const Profile = () => (
    <>
      {image && (
        <Image
          src={image.url}
          width={48}
          height={48}
          alt={name}
          className="rounded-full"
        />
      )}
      <div className="leading-tighter">
        <span className="text-xs uppercase">author</span>
        <div className="font-semibold">{name}</div>
      </div>
    </>
  )
  return name ? (
    path ? (
      <Link href={path} className="inline-flex items-center space-x-2">
        <Profile />
      </Link>
    ) : (
      <div className="inline-flex items-center space-x-2">
        <Profile />
      </div>
    )
  ) : null
}

const query = groq`*[_type == "post" && slug.current == $slug][0]{
  title,
  "author": authors[][0].author->,
  "categories": categories[]->title,
  seo,
  coverImage,
  body,
  "slug": slug.current,
  "articleResources": resources[type == "collection"]{
    "location": content[0].text,
    title,
    description,
    "slug": slug.current,
    "podcasts": resources[type == "podcast"]{
      title,
      image,
      path,
      "description": byline,
      "slug": slug.current,
      "name": type,
    },
    "collections": resources[type == "collection"]{
     title,
     'courses': resources[]->{
        type,
        title,
        image,
        path,
        "description": summary,
        byline,
        'instructor': collaborators[@->.role == 'instructor'][0]->{
          title,
          'slug': person->slug.current,
          'name': person->name,
          'path': person->website,
          'twitter': person->twitter,
          'image': person->image.url
        },
      },
    },
    "articles": resources[type == "article"]{
      title,
      image,
      path,
      byline,
      description,
      "name": type,
      "slug": slug.current,
      'instructor': collaborators[][0]->{
        title,
        'slug': person->slug.current,
        'name': person->name,
        'path': person->website,
        'twitter': person->twitter,
        'image': person->image.url
      },
    },
    "talks": resources[_type == "reference"]->{
      title,
      image,
      "description": byline,
      byline,
      path,
      "name": type,
    }
  },
  "resources": resources[]-> {
    title,
    'instructor': collaborators[@->.role == 'instructor'][0]->{
       'full_name': person->.name
     },
    path,
    "slug": slug.current,
    "image_thumb_url": image,
    "lessons": resources[] {
      title,
      path
    }
  }
}`

export async function getStaticProps(context: any) {
  const slug: string = context.params.slug

  const {body, ...post} = await sanityClient.fetch(query, {
    slug,
  })

  const mdxSource = await serialize(body, {
    mdxOptions: {
      remarkPlugins: [
        remarkGfm,
        require(`remark-slug`),
        require(`remark-footnotes`),
        require(`remark-code-titles`),
      ],
      rehypePlugins: [
        [
          require(`rehype-shiki`),
          {
            theme: `./src/styles/material-theme-dark.json`,
            useBackground: false,
          },
        ],
      ],
    },
  })
  return {
    props: {...post, slug, source: mdxSource},
    revalidate: 1,
  }
}

const allPostsQuery = groq`
  *[_type == "post" && publishedAt < now() && !(_id in path("drafts.**"))]{
    "slug": slug.current
  }
`

export async function getStaticPaths() {
  const allPosts = await sanityClient.fetch(allPostsQuery)

  const paths = allPosts.map((post: {slug: string}) => {
    return {
      params: {
        slug: post.slug,
      },
    }
  })

  return {
    paths,
    fallback: false,
  }
}

export default Tag
