import mergeStream from 'merge-stream'
import helper from '../helpers/scss'
import themes from '../helpers/get-themes'

export const styles = async () => {
  const streams = await Promise.all(themes().map(helper));
  return mergeStream(streams);
}
