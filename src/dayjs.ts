import dayjs from "dayjs"
// relativeTime plugin
import relativeTime from "dayjs/plugin/relativeTime"
// chinese locale
import "dayjs/locale/zh-cn"

dayjs.locale("zh-cn")
dayjs.extend(relativeTime)