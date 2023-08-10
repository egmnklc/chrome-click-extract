console.log("contentScript")
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//     console.log('Received message from background.js:', message);
//     if (message.message === 'start') {
//         highlighting = true;
//         sendResponse('Message received');
//     }
// });
// -----------------------This is the hover-highlighter--------------------------
// let highlightedElement = null;

// document.addEventListener('mouseover', (event) => {
//   const target = event.target;
//   if (highlightedElement !== target) {
//     if (highlightedElement) {
//       highlightedElement.style.backgroundColor = '';
//     }
//     target.style.backgroundColor = 'yellow';
//     highlightedElement = target;
//   }
// });

// document.addEventListener('mouseout', (event) => {
//   if (highlightedElement) {
//     highlightedElement.style.backgroundColor = '';
//     highlightedElement = null;
//   }
// });
// ---------------------------------------------------
let highlightedElements = [];
let copiedText = '';
let isHighlighting = false;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === 'startHighlighting') {
    isHighlighting = true;
  } else if (request.message === 'stopHighlighting') {
    isHighlighting = false;
    removeHighlighting();
  }
});

function highlightElement(element) {
  if (element) {
    element.style.outline = '2px solid red';
    element.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
    highlightedElements.push(element);
  }
}


function removeHighlighting() {
  highlightedElements.forEach(element => {
    element.style.outline = '';
    element.style.backgroundColor = '';
  });
  highlightedElements = [];
  copiedText = '';
}

function handleCopy(e) {
  e.preventDefault();
  let elementsToCopy = []; // Initialize elementsToCopy here
  let emptyTextContents = 0;
  let totalTextContents = 0;
  if (highlightedElements.length > 0) {
    highlightedElements.forEach(element => {
      let attributes = Array.from(element.attributes).reduce((acc, attribute) => {
        acc[attribute.name] = attribute.value + " ";
        return acc;
      }, {});

      let textContent = element.innerText.trim();
      totalTextContents++;

      if (textContent !== '') {
        elementsToCopy.push({
          tagName: element.tagName,
          attributes: attributes,
          textContent: textContent + " "
        });
      } else {
        emptyTextContents++;
      }
    });
  }

  copiedText = JSON.stringify({
    elements: elementsToCopy,
    ignoredEmptyTextContents: emptyTextContents,
    totalTextContents: totalTextContents
  }, null, 2); // Format JSON with 2 spaces for indentation
  navigator.clipboard.writeText(copiedText);
}

function handleHover(e) {
  if (!isHighlighting) return;

  let target = e.target;
  removeHighlighting();
  let similarElements = Array.from(document.querySelectorAll('div, ul, li'));
  let targetHtml = getEmptyElementHtml(target);
  similarElements.forEach(element => {
    if (getEmptyElementHtml(element) === targetHtml) {
      highlightElement(element);
    }
  });

  if (target.tagName.toLowerCase() === 'div') {
    let ulElements = Array.from(target.querySelectorAll('ul'));
    ulElements.forEach(ulElement => {
      highlightElement(ulElement);
      let liElements = Array.from(ulElement.querySelectorAll('li'));
      liElements.forEach(liElement => {
        highlightElement(liElement);
      });
    });
  } else if (target.tagName.toLowerCase() === 'ul') {
    let liElements = Array.from(target.querySelectorAll('li'));
    liElements.forEach(liElement => {
      highlightElement(liElement);
    });
  } else if (target.tagName.toLowerCase() === 'li') {
    let ulElement = target.closest('ul');
    if (ulElement) {
      highlightElement(ulElement);
      let liElements = Array.from(ulElement.querySelectorAll('li'));
      liElements.forEach(liElement => {
        highlightElement(liElement);
      });
    }
  }

  target.addEventListener('click', handleCopy);
}


function getEmptyElementHtml(element) {
  let html = element.outerHTML;
  let contentStart = html.indexOf('>') + 1;
  let contentEnd = html.lastIndexOf('<');
  return html.slice(0, contentStart) + html.slice(contentEnd);
}

function extractProductData(element) {
  let productData = {};

  let titleElement = element.querySelector('.prdct-desc-cntnr-name.hasRatings');
  let nameElement = element.querySelector('.prdct-desc-cntnr-ttl');
  if (titleElement) {
      productData.productTitle = titleElement.getAttribute('title');
  }
  if (nameElement) productData.productName = nameElement.innerText;

  let ratingCountElement = element.querySelector('.ratingCount');
  if (ratingCountElement) productData.ratingCount = parseInt(ratingCountElement.innerText.replace('(', '').replace(')', ''));

  let imgElement = element.querySelector('.p-card-img');
  if (imgElement) productData.productImageUrl = imgElement.getAttribute('src');

  let priceElement = element.querySelector('.prc-box-dscntd');
  if (priceElement) productData.price = priceElement.innerText;

  let badgesElement = element.querySelector('.badges-wrapper');
  if (badgesElement) productData.badgesContent = badgesElement.innerText;

  let ratingsElement = element.querySelector('.ratings');
  if (ratingsElement) productData.ratingsContent = ratingsElement.innerText;

  let linkElement = element.querySelector('a');
  if (linkElement) productData.productLink = linkElement.getAttribute('href');

  productData.dataId = element.getAttribute('data-id'); // Extract data-id attribute

  return productData;
}

let productElements = document.querySelectorAll('[data-id]'); // Select all elements with a data-id attribute
let productsData = Array.from(productElements).map(extractProductData);
console.log(productElements)
console.log(productsData);


// Separate event listeners for 'div', 'ul', and 'li' elements
document.body.addEventListener('mouseover', function (e) {
  if (isHighlighting && e.target.tagName.toLowerCase() === 'div') {
    handleHover(e);
  }
}, false);

document.body.addEventListener('mouseover', function (e) {
  if (isHighlighting && (e.target.tagName.toLowerCase() === 'ul' || e.target.tagName.toLowerCase() === 'li')) {
    handleHover(e);
  }
}, false);

