import _ from 'lodash';
import type { FormInstance } from 'rc-field-form';
import type { Tree } from './tree';

export const flatObject = (obj: Record<any, any>) => {
  const result: Record<any, any> = {};
  const fn = (item: Record<any, any>, parentKey: string) => {
    if (item.relation) {
      result[(parentKey ? `${parentKey}.` : '') + 'relation'] = item.relation;
      item.children?.forEach((arrayItem: any, index: number) => {
        fn(
          arrayItem,
          (parentKey ? `${parentKey}.` : '') + 'children' + '.' + index,
        );
      });
    } else {
      for (const key in item) {
        if (item.hasOwnProperty(key)) {
          const val = item[key];
          result[(parentKey ? `${parentKey}.` : '') + key] =
            typeof val === 'object' ? _.cloneDeep(val) : val;
        }
      }
    }
  };
  fn(obj, '');
  return result;
};

export const createCurrentKey = (namePath: string[]) => {
  return ['0', ...namePath].join('-');
};

export type Line = {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  id: string;
};

export const drawSvg = (lines: Line[]) => {
  const svg = document.querySelector('#svg-drag') as HTMLElement;

  const ruleTreeEle = document.querySelector('.rule-tree') as HTMLElement;
  const ruleTreeStyle = window.getComputedStyle(ruleTreeEle);

  svg.style.height = ruleTreeStyle.height;
  svg.style.width = ruleTreeStyle.width;

  svg.innerHTML = lines
    .map((line) => {
      const midX = (line.fromX + line.toX) / 2 + 0.5;
      return `<path id="${line.id}" d="M${line.fromX},${line.fromY} L${midX},${line.fromY} M${midX},${line.fromY} L${midX},${line.toY} M${midX},${line.toY} L${line.toX},${line.toY}" stroke="#1890ff" fill="none" style="stroke-width: 0;"></path>`;
    })
    .join('');
};

export const drawSvgFromTreeInstance = (treeInstance: Tree) => {
  const lines: Line[] = [];

  const rootContainerRects = (
    document.querySelector('.rule-tree') as HTMLElement
  ).getClientRects()[0];

  const fn = <T extends any[]>(children: T) => {
    if (!children?.[0]) return;
    const parent = children[0]?.parent;
    const parentId = createCurrentKey(parent.namePath);
    const parentRects = (
      document.querySelector(`.id-${parentId} .relation`) as HTMLElement
    ).getClientRects();

    _.forEach<HTMLElement>(
      document.querySelectorAll(
        `.dp-id-${createCurrentKey(parent.namePath)}`,
      ) as any,
      (item) => {
        const childRects = item.getClientRects();
        const order = item.getAttribute('data-order');
        lines.push({
          fromX:
            parentRects[0].left +
            parentRects[0].width -
            rootContainerRects.left,
          fromY:
            parentRects[0].top +
            parentRects[0].height / 2 -
            rootContainerRects.top,
          toX: childRects[0].left - rootContainerRects.left,
          toY:
            childRects[0].top +
            childRects[0].height / 2 -
            rootContainerRects.top,
          id: `f-${createCurrentKey(parent.namePath)}-o-${order}`,
        });
      },
    );
    children.forEach((child) => {
      if (child.type === 'RELATION') {
        fn(child.children);
      }
    });
  };
  fn(treeInstance.getRoot().children);
  drawSvg(lines);
};

export const resetFields = (form: FormInstance, newValue: Record<any, any>) => {
  const flattenValue = flatObject(newValue);
  Object.keys(flattenValue).forEach((flattenKey) => {
    const name = flattenKey.split('.').filter((k) => k !== 'children');
    if (!name.join('')) {
      return;
    }
    let namePath = name;
    if (name.length > 2) {
      namePath = [name.slice(0, -1).join('.')].concat(name[name.length - 1]);
    }
    form.setFields([
      {
        name: namePath,
        value: flattenValue[flattenKey],
      },
    ]);
  });
};
