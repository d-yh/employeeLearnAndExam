import defaultSettings from '@/settings'

const title = defaultSettings.title || '企业培训管理系统'

export default function getPageTitle(pageTitle) {
  if (pageTitle) {
    return `${pageTitle} - ${title}`
  }
  return `${title}`
}
