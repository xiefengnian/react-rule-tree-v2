import _ from 'lodash';
import { useEffect } from 'react';
import { DROP_INNER_HEIGHT } from '../constants';

export const useDrawLine = () => {
  useEffect(() => {
    // 后置绘制线
    const relationChildren = document.querySelectorAll('.relation-children');
    relationChildren.forEach((ele) => {
      // 绘制普通连线
      const line = _.find(ele.children, (child) => child.className.includes('relation-line'));
      if (!line) return;
      const firstChild = ele.children[2];
      if (!firstChild) return;
      const firstChildHeight = parseFloat(window.getComputedStyle(firstChild).height);
      line.setAttribute(
        'style',
        `height: calc(100% - ${firstChildHeight / 2 + 40 - DROP_INNER_HEIGHT}px); top: ${
          firstChildHeight / 2 - DROP_INNER_HEIGHT + 26
        }px;`,
      );
    });
  });
};
