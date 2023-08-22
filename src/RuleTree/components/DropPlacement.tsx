import React from 'react';
import { useDrop } from 'react-dnd';
import cx from 'classnames';
import { createCurrentKey } from '../utils';

export const TYPE = 'TREE_NODE';

interface Props {
  relatedKeys: number[];
  parentKey: number;
  order: number;
  parentNamePath: string[];
}

export const DropPlacement: React.FC<Props> = ({
  relatedKeys,
  children,
  parentKey,
  order,
  parentNamePath,
}) => {
  const namePath = parentNamePath.slice().concat(`${order}`);

  const [{ canDrop, isOver }, drop] = useDrop(
    () => ({
      accept: TYPE,
      collect: (monitor) => {
        return {
          isOver: monitor.isOver(),
          // 不知道为什么要做个判断，但是了写了就不报错找不到 target 的错误
          canDrop: monitor.getItemType() === TYPE ? monitor.canDrop() : monitor.canDrop(),
        };
      },
      canDrop: (item: {
        thisKey: number;
        parentKey: number;
        order: number;
        namePath: string[];
        from: 'external' | 'internal';
        currentIndex: number;
      }) => {
        const { from } = item;
        if (from === 'internal') {
          if (namePath && item.namePath && namePath.join('.').startsWith(item.namePath.join('.'))) {
            return false;
          }
          if (relatedKeys.includes(item.thisKey)) {
            return false;
          }
          return true;
        }
        return true;
      },
      drop: (item) => {
        return {
          ...item,
          parentKey,
          originOrder: order, // 保留原始的 order，跨层级拖拽时需要用到
          order: item.currentIndex < order ? order - 1 : order, // 向下拉的时候 order 需要-1
        };
      },
    }),
    [relatedKeys, parentKey, namePath],
  );

  let bgColor = '';
  if (isOver) {
    bgColor = canDrop ? 'rgb(24,144,255)' : 'red';
  } else {
    bgColor = 'rgb(145,213,255)';
  }

  const pathId = `#f-${createCurrentKey(parentNamePath)}-o-${order}`;

  const currentPath = document.querySelector(pathId) as HTMLElement;
  if (currentPath) {
    currentPath.style.strokeWidth = canDrop ? '1' : '0';
  }

  return (
    <div
      ref={drop}
      style={{
        backgroundColor: bgColor,
        opacity: canDrop ? 1 : 0,
      }}
      className={cx('drop-placement', `dp-id-${createCurrentKey(parentNamePath)}`)}
      data-order={order}
      data-p={parentKey}
      data-r={relatedKeys.join(',')}
      data-namepath={namePath.join(',')}
    >
      {children}
    </div>
  );
};
