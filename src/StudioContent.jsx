import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { Backpack, CircleDot, HandHeart, Music2, School, Users } from 'lucide-react'
import { news as fallbackPosts, programs as fallbackPrograms } from './content'
import eventManifest from '../migration/event-manifest.json'
import { getStudioSnapshot } from './bridge'

const ICONS = { Backpack, CircleDot, HandHeart, Music2, School, Users }
const FALLBACK_VALUE = { connected: false, site: null, pages: [], posts: fallbackPosts, programs: fallbackPrograms, events: eventManifest.events || [], media: [] }
const StudioContentContext = createContext(FALLBACK_VALUE)

function normalizeSnapshot(snapshot) {
  const connectedPrograms = snapshot.programs?.map((program) => ({
    ...program,
    icon: ICONS[program.icon] || HandHeart,
  }))
  const connectedPosts = snapshot.posts?.map((post) => ({
    ...post,
    copy: post.excerpt || post.body,
    href: post.externalUrl || `/news/${post.slug}`,
  }))
  return {
    connected: true,
    site: snapshot.site || null,
    pages: snapshot.pages || [],
    posts: connectedPosts?.length ? connectedPosts : fallbackPosts,
    programs: connectedPrograms?.length ? connectedPrograms : fallbackPrograms,
    events: snapshot.events?.length ? snapshot.events : eventManifest.events || [],
    media: snapshot.media || [],
  }
}

export function StudioContentProvider({ children }) {
  const [snapshot, setSnapshot] = useState(FALLBACK_VALUE)

  useEffect(() => {
    let current = true
    getStudioSnapshot().then((payload) => {
      if (current) setSnapshot(normalizeSnapshot(payload))
    }).catch(() => {})
    return () => { current = false }
  }, [])

  const value = useMemo(() => snapshot, [snapshot])
  return <StudioContentContext.Provider value={value}>{children}</StudioContentContext.Provider>
}

// The hook lives beside its provider so callers share one private context instance.
// eslint-disable-next-line react-refresh/only-export-components
export function useStudioContent() {
  return useContext(StudioContentContext)
}
