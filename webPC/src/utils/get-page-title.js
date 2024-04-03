import defaultSettings from '@/settings'

const title = defaultSettings.title || 'HUIYU 辉宇'

export default function getPageTitle(pageTitle) {
  if (pageTitle) {
    return `${pageTitle} - ${title}`
  }
  return `${title}`
}
