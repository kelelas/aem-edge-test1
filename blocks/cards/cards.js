import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  /* change to ul, li */
  let linkType;
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      linkType = findLinkType(div, linkType);
      renderDgl(div, linkType);
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.append(ul);
}

function findLinkType(div, linkType) {
  const linkTypeContainer = Array.from(div.children)?.find((child) => child.dataset?.aueProp === 'linkType');

  if (linkTypeContainer) {
    linkType = linkTypeContainer.innerText;
  }

  return linkType;
}

async function renderDgl(div, linkType) {
  const dglDiv = Array.from(div.children)?.find((child) => child.dataset?.aueProp === 'dgl');
  if (linkType === 'dgl' && dglDiv) {
    try {
      const url = new URL('https://16778-dgltest-stage.adobeio-static.net/api/v1/web/dgl/dglIdSearch');
      url.searchParams.append('id', JSON.parse(dglDiv.innerText).id)
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      if (response.ok) {
        const body = await response.json();
        console.log(body);
        dglDiv.innerText = body.approvedVersionDownloadUrl;
      }
    } catch (error) {
      console.error('Invalid JSON in dglDiv:', error);
    }
  }
}

