export function isVoid(val) {
  return val === undefined || val === null || val === ''
}
export function isValid(val) {
  return !isVoid(val)
}

export function mergeProps(TProps, $props, $data) {
  const propsKeys = Object.keys(TProps)
  const dataKeys = Object.keys($data)
  return propsKeys.reduce((res, k) => {
    let innerKey = `inner${k.substring(0, 1).toUpperCase()}${k.substring(1)}`
    let valid = isValid($props[k])
    if (dataKeys.includes(innerKey)) {
      res[k] = $data[innerKey]
    } else if (valid) {
      res[k] = $props[k]
    }
    return res
  }, {})
}

export function getWindowGrid() {
  const ww = window.innerWidth
  let res = ''
  switch (true) {
    case ww >= 1920:
      res = 'xl'
      break
    case ww >= 1200:
      res = 'lg'
      break
    case ww >= 992:
      res = 'md'
      break
    case ww >= 768:
      res = 'sm'
      break
    default:
      res = 'xs'
  }
  return res
}

/**
 * 下载文件流
 * @param {Object | Blob} url -
 * @param {String} saveName - 文件名
 */
export function openDownloadDialog(url, saveName)
{
	if(typeof url == 'object' && url instanceof Blob)
	{
		url = URL.createObjectURL(url); // 创建blob地址
	}
	var aLink = document.createElement('a');
	aLink.href = url;
	aLink.download = saveName || ''; // HTML5新增的属性，指定保存文件名，可以不要后缀，注意，file:///模式下不会生效
	var event;
	if(window.MouseEvent) event = new MouseEvent('click');
	else
	{
		event = document.createEvent('MouseEvents');
		event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
	}
	aLink.dispatchEvent(event);
}

export const asyncAsset = function(src, options = { prepend: false }) {
  const isStyle = /\/\/.+\.css$/.test(src)
  let element = undefined

  if (isStyle) {
    element = document.createElement('link')
    element.rel = 'stylesheet'
    element.href = src
  } else {
    element = document.createElement('script')
    element.type = 'text/javascript'
    element.src = src
  }
  if (options.props) {
    Object.keys(options.props).forEach(attr => {
      element.setAttribute(attr, options.props[attr])
    })
  }
  return new Promise((resolve, reject) => {
    element.onload = function(e, m) {
      resolve(e, m)
    }
    element.onerror = function(e) {
      reject(e)
    }
    options.prepend ? document.head.appendChild(element) : document.body.appendChild(element)
  })
}