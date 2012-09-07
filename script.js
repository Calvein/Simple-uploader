/*global webkitNotifications:false */

// https://gist.github.com/1002315
function cssProp(s){return eval(0+"O-Moz-Webkit-Ms-".replace(/.*?-|$/g,"||(s='$&"+s+"')in new Image().style&&s").replace(/-(.)/g,"'+'$1'.toUpperCase()+'"))}

!function() {
    "use strict";

    // Yay jQuery \o/
    var $ = function(q) {
        return $uploader.querySelector(q)
    }
    // Declare Elements
      , $uploader = document.querySelector('#uploader')
      , $figure = $('figure')
      , $mask = $('figure > div')
      , $label = $('label')
      , $file = $('#file')
      , $progress = $('progress')
      , $ok = $('ul')

    function uploadFile(e) {
        // If it's dropped
        this.classList.remove('over')
        e.stopPropagation()
        e.preventDefault()
        var files = this.files || e.dataTransfer.files
          , file = files[0]
          , isImage = /^image\//.test(file.type)
          , dataURI = ''
          , xhr = new XMLHttpRequest()
          , upload = xhr.upload

        // Reader
        if (isImage) {
            var reader = new FileReader()

            // http://code.google.com/p/chromium/issues/detail?id=48367
            //reader.addEventListener('onload', function(e) {
            reader.onload = function(e) {
                dataURI = this.result
                var img = document.createElement('img')
                img.src = this.result
                img.alt = file.name
                img.style.display = 'inline'
                $mask.insertBefore(img, null)
            }

            reader.readAsDataURL(file)
        } else {
            $figure.style.display = 'none'
            $label.style.borderLeftWidth = 0
            $ok.style.left = 0
            $uploader.style.width = '118px'
        }

        // XHR
        // upload.php is a tiny test in php, you can also send a FormData
        xhr.open('POST', 'upload.php')

        upload.addEventListener('loadstart', function(e) {
            $label.style.display = 'none'
            $progress.style.opacity = 1
            $file.style.zIndex = -1
            if (isImage) {
                $uploader.style.width = '32px'
                $progress.style.left = '40px'
                $ok.style.left = '40px'
            } else {
                $uploader.style.width = 0
                $uploader.style.borderWidth = 0
            }
        }, false)

        upload.addEventListener('progress', function(e) {
            if (e.lengthComputable) {
                var percentLoaded = Math.round((e.loaded / e.total) * 100)
                if (percentLoaded < 100) {
                    $progress.value = percentLoaded
                    $mask.style.height = 20 * percentLoaded / 100 + 'px'
                }
            }
        }, false)

        upload.addEventListener('load', function(e) {
            if ('webkitNotifications' in window && webkitNotifications.checkPermission() === 0) {
                webkitNotifications.createNotification(dataURI, 'Upload complete', 'The ' + file.type.split('/')[0] + ' "' + file.name + '" was successfully uploaded').show()
            }

            $mask.style.height = '24px'
            $progress.value = 100
            $progress.style.opacity = 0
            $ok.style.opacity = 1
            $ok.className = 'ok'
        }, false)

        xhr.setRequestHeader("Cache-Control", "no-cache")
        xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest")
        xhr.setRequestHeader("X-File-Name", file.name)
        xhr.send(file)
    }

    $file.addEventListener('click', function(e) {
        if ('webkitNotifications' in window && webkitNotifications.checkPermission() !== 0)
            webkitNotifications.requestPermission()
    }, false)
    $file.addEventListener('change', uploadFile, false)
    $uploader.addEventListener('drop', uploadFile, false)

    // Change the style when hovered
    var hover = function(e) {
        this.classList.toggle('over')
    }
    $uploader.addEventListener('dragenter', hover, false)
    $uploader.addEventListener('dragleave', hover, false)

    $uploader.addEventListener('dragover', function(e) {
        e.stopPropagation()
        e.preventDefault()
    }, false)

    // Remove link
    $('a').addEventListener('click', function(e) {
        e.preventDefault()

        $uploader.style.opacity = 0
        $uploader.style[cssProp('animation')] = 'fadeout 1.5s 1 ease-in'
    }, false)

    $uploader.addEventListener('animationend', animationEnd, false)
    $uploader.addEventListener('webkitAnimationEnd', animationEnd, false)

    function animationEnd(e) {
        if (e.target.id && e.animationName === 'fadeout') {
            // Reset the styles at the end of the animation
            var $img = $('img')
            if ($img)
                $img.parentNode.removeChild($img)
            $label.style.display = 'inline-block'
            $progress.style.opacity = 0
            $file.style.zIndex = 1
            $ok.style.left = '40px'
            $ok.style.opacity = 0
            $figure.style.display = 'inline-block'
            $label.style.borderLeftWidth = '1px'
            $uploader.style.borderWidth = '1px'
            $uploader.style[cssProp('transition')] = 'width 0s'
            $uploader.style.width = '150px'
            $uploader.style.opacity = 1

            // reset the input
            $file.value = ''
            // You may want to delete it on the server too, feel free to add an AJAX request here

            $uploader.style[cssProp('animationName')] = 'fadein'
        } else {
            $uploader.style[cssProp('transition')] = 'width .5s'
        }
    }
}()