import groq from 'groq'

import CtaCard from 'components/search/components/cta-card'
import SearchInstructorEssential from '../instructor-essential'

const SearchKadiKraman = ({instructor}: {instructor: any}) => {
  const {courses} = instructor

  if (!courses) {
    return (
      <div className="max-w-screen-xl mx-auto">
        <SearchInstructorEssential instructor={instructor} />
      </div>
    )
  }

  const [primaryCourse] = courses.resources

  return (
    <div className="max-w-screen-xl mx-auto">
      <SearchInstructorEssential
        instructor={instructor}
        CTAComponent={
          <CtaCard
            resource={primaryCourse}
            textLight
            trackTitle="clicked instructor landing page CTA resource"
            location="Kadi Kraman instructor page"
          />
        }
      />
    </div>
  )
}
export default SearchKadiKraman

export const KadiKramanQuery = groq`
*[_type == 'resource' && slug.current == 'kadi-kraman-landing-page'][0]{
  title,
  'courses': resources[slug.current == 'instructor-landing-page-featured-courses'][0]{
    resources[]->{
       title,
       'description': summary,
       path,
       byline,
       image,
       'background': images[label == 'feature-card-background'][0].url,
       'instructor': collaborators[@->.role == 'instructor'][0]->{
         'name': person->.name
       },
     }
    },
 }
`
