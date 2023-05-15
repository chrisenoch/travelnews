'use strict'

//available image widths (images for each of these widths are always available);
const availableWidths = [400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1400, 1600, 1800, 2000, 2100, 2200];
const images = getImageArr();
renderImages(images, availableWidths, true);
let onResizeFinish;
window.addEventListener("resize", () => { //Idea for how to resize on finished resize from: https://www.geeksforgeeks.org/how-to-wait-resize-end-event-and-then-perform-an-action-using-javascript/
    clearTimeout(onResizeFinish);
    onResizeFinish = setTimeout(() => renderImagesOnResize(images, availableWidths), 100);
});
window.addEventListener("resize", () => console.log(getDevicePixelRatio()));

function renderImagesOnResize(images, availableWidths) {
    //render a new size for existing images
    renderImages(images, availableWidths, false);

    //check if any new image containers have been added with class 'auto-resize' Maybe they were added via JavaScript for a certain screen size.
    let newImages = getImageArr();
    renderImages(newImages, availableWidths, true);

    //update global images array;
    images.push(...newImages); //Maintain reference to original images array passed into function. Do not return a new array here. E.g. do not do this: images = [...images, ...newImages];
}

function renderImages(images, availableWidths, isFirstRender) { //imageContainerClass is the class that signifies that its child image should be resized
    if (images.length === 0) {
        return;
    }
    let DPR = getDevicePixelRatio();

    let imageContainerClass = isFirstRender ? 'auto-resize' : 'was-auto-resized';
    images.forEach((image) => {
        //get parent
        let imageContainer = findClosestParentWithClass(image, imageContainerClass);
        if (!imageContainer) {
            console.error("Error: - No imageContainer detected. Each image should have one image container");
            return;
        }

        let renderedWidth = imageContainer.clientWidth;
        let idealWidth = renderedWidth * DPR;
        let src = image.src;
        let imageSizeToRender = getImageSize(idealWidth, availableWidths);//find an avilable image which is closest fit to idealWidth
        let pathSeparator = getPathSeparator(src);

        //E.g. src: 'http://127.0.0.1:5500/img/pixabay/taj-mahal-1920-1280.jpg'
        if (src[src.length - 1] === pathSeparator) {
            src = src.substring(0, src.lastIndexOf(pathSeparator));
        }
        let fileExt = src.substring(src.lastIndexOf('.') + 1);
        let imageDir = pathSeparator ? src.substring(0, src.lastIndexOf(pathSeparator)) : "";
        imageDir += pathSeparator;
        let imageName;
        if (pathSeparator) {
            imageName = src.substring(src.lastIndexOf(pathSeparator) + 1);
            imageName = imageName.substring(0, imageName.lastIndexOf('.'));
            let imageSizeExt = getImageSizeExt(imageName);//check if image ends in number. E.g. beach-500
            if (imageSizeExt) { //delete from imageName
                imageName = imageName.substring(0, imageName.lastIndexOf(imageSizeExt));
            }

        } else {
            imageName = src;
        }
        let newImage = imageDir + imageName + '-' + imageSizeToRender + '.' + fileExt;
        image.src = newImage;

        //remove class from imageContainer so as to display the image
        if (isFirstRender) {
            imageContainer.classList.remove('auto-resize');
            imageContainer.classList.add('was-auto-resized');
        }

    });

}

//returns the size extension of the image if exists or returns empty string
//imageName should be the image name with no preceeding directory path, no leading slashes and no file extension. E.g. "beach" or "beach-200"
function getImageSizeExt(imageName) {
    //e.g. virgin_cruises-220
    let imageNameArr = imageName.split("");
    let hyphenIndex = imageNameArr.lastIndexOf('-');
    if (hyphenIndex === -1) {
        return "";
    }
    //- then check all following characters are numbers and count - max 5 numbers
    let afterHyphen = imageNameArr.slice(hyphenIndex + 1);

    let count = 0;
    for (const ele of afterHyphen) {
        if (count > 4) {
            return "";
        }
        if (isNaN(+ele)) {
            return ""; // E.g. foo-bar or foo-5bar would return
        } else {
            count++;
        }
    }

    //extract size extension
    let sizeExt = imageName.substring(imageName.lastIndexOf('-'));
    return sizeExt;
}

function sortNumAsc(a, b) { return a - b };
//could try binary search option mixed with looping. //imageSize = -1;
//what if next image up is huge? don't show it? - see what browser does? test this
function getImageSize(idealSize, availableSizes) {
    availableSizes = availableSizes.sort(sortNumAsc);
    let lowerVals = [];
    let higherVals = [];
    let imageSize;

    for (let ele of availableSizes) {
        if (ele === idealSize) {
            imageSize = idealSize;
            return imageSize;
        }
        if (ele < idealSize) {
            lowerVals.push(ele);
        }
        if (ele > idealSize) {
            higherVals.push(ele);
        }
    }

    if (imageSize === idealSize) {
        return imageSize;
    } else if (higherVals.length < 1) {
        //return highest possible value
        imageSize = lowerVals[lowerVals.length - 1];
        return imageSize;
    } else {
        imageSize = higherVals[0];
        return imageSize;
    }
}

//code getDevicePixelRatio from StackOverflow. The rest of the code is mine.
function getDevicePixelRatio() {
    let ratio = 1;
    // To account for zoom, change to use deviceXDPI instead of systemXDPI
    if (window.screen.systemXDPI !== undefined && window.screen.logicalXDPI !== undefined && window.screen.systemXDPI > window.screen.logicalXDPI) {
        // Only allow for values > 1
        ratio = window.screen.systemXDPI / window.screen.logicalXDPI;
    }
    else if (window.devicePixelRatio !== undefined) {
        ratio = window.devicePixelRatio;
    }
    return ratio;
};


//easier this way because a child only has one parent, but a parent may have many children.
function findClosestParentWithClass(element, className) {
    let parent = '';
    let count = 0;
    function helper(element, className) {
        let parentEle = element.parentElement;
        if (!parentEle) {
            return;
        }
        let parentClasses = Array.from(parentEle.classList);
        if (parentClasses.includes(className)) {
            parent = parentEle;
            return;
        } else {
            helper(parentEle, className);
        }
    }
    if (count < 1) {
        helper(element, className);
    }
    count++;
    return parent;

}

function getImageArr() {
    let images = Array.from(getImageSet());
    return images;
}

function getImageSet() {
    let imageSet = new Set();
    let imageContainers = document.querySelectorAll('.auto-resize');
    let imagesInContainer;
    for (let imageContainer of imageContainers) {
        imagesInContainer = imageContainer.getElementsByTagName('img');
        for (let image of imagesInContainer) {
            console.log('image: '); console.dir(image);
            imageSet.add(image);
        }
    }
    return imageSet;
}

function getPathSeparator(fileName) {
    let pathSeparator;
    if (fileName.lastIndexOf('/') !== -1) {
        pathSeparator = '/';
    } else if (fileName.lastIndexOf('\\') !== -1) {
        pathSeparator = '\\';
    } else {
        pathSeparator = null;
    }
    return pathSeparator
}

