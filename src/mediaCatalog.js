import mediaManifest from '../migration/media-manifest.json'
import { siteAsset } from './sitePaths'

const withWebAsset = (item) => Boolean(item.web)
const toMediaItem = (item, index) => ({
  id: `${item.kind}-${index}-${item.original}`,
  name: item.original,
  src: siteAsset(item.web),
})

export const archivePhotos = mediaManifest.files
  .filter((item) => item.kind === 'photo' && withWebAsset(item))
  .map(toMediaItem)

export const archiveGraphics = mediaManifest.files
  .filter((item) => item.kind === 'graphic' && withWebAsset(item))
  .map(toMediaItem)

export const archiveVideos = mediaManifest.files
  .filter((item) => item.kind === 'video' && withWebAsset(item))
  .map(toMediaItem)

export const sourceGraphics = mediaManifest.files
  .filter((item) => item.kind === 'source-graphic')

export const mediaArchiveSummary = {
  sourceFiles: mediaManifest.total,
  photos: archivePhotos.length,
  graphics: archiveGraphics.length,
  videos: archiveVideos.length,
  sourceGraphics: sourceGraphics.length,
}
