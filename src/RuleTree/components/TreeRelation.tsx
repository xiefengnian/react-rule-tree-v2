import { DeleteFilled, HolderOutlined, PlusOutlined } from '@ant-design/icons';
import cx from 'classnames';
import Form from 'rc-field-form';
import React from 'react';
import { prefixCls } from '../constants';
import type { Tree } from '../tree';
import type { IndexParams, Node, RowConfig, RuleTreeProps } from '../type';
import type { DragItemProps } from './DragItem';
import { DragItem } from './DragItem';
import { DropPlacement } from './DropPlacement';
import { Fragment } from './Fragment';
import { AnyFunction, ReactPropsTypeWithChildren } from './TreeField';

type TreeRelationProps = Pick<
  RuleTreeProps,
  'relationRender' | 'modifyButton'
> & {
  currentKey: string;
  currentNode: Node<any>;
  isRoot: boolean;
  indexParams: IndexParams;
  id: string;
  rowConfig: RowConfig;
  onMove: DragItemProps['onMove'];
  treeInstance: Tree;
  render: any;
  handleAdd: AnyFunction;
  handleRemove: AnyFunction;
  nodeKey: number;
  mapKey: string;
};

type RelationElementProps = {
  value: any;
  onChange: any;
  rowConfig: RowConfig;
};
class RelationElement extends React.Component<
  RelationElementProps & ReactPropsTypeWithChildren
> {
  shouldComponentUpdate(nextProps: Readonly<RelationElementProps>): boolean {
    if (this.props.value === nextProps.value) {
      return false;
    }
    return true;
  }
  render(): React.ReactNode {
    const { children, value, onChange, rowConfig } = this.props;
    return React.cloneElement(children as React.ReactElement, {
      ...(children as React.ReactElement).props,
      ...{
        disabled: rowConfig.disabled,
      },
      ...{
        value,
        onChange,
      },
    });
  }
}

class TreeRelation extends React.Component<TreeRelationProps> {
  shouldComponentUpdate(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    nextProps: Readonly<TreeRelationProps>,
  ): boolean {
    return true;
  }

  render(): React.ReactNode {
    const {
      currentKey,
      currentNode,
      isRoot,
      indexParams,
      id,
      rowConfig,
      onMove,
      relationRender,
      treeInstance,
      render,
      handleAdd,
      modifyButton,
      handleRemove,
    } = this.props;
    const { children = [] } = currentNode;

    const RelationDragItem: any = isRoot ? Fragment : DragItem;

    const relationNamePath = isRoot
      ? ['relation']
      : [currentNode.namePath.join('.')].concat('relation');

    const addRuleButtonConfig = {
      text: '添加规则',
      disabled: false,
      ...(modifyButton?.({ type: 'add', depth: currentNode.depth }) || {}),
    };
    const addRuleGroupButtonConfig = {
      text: '添加规则组',
      disabled: false,
      ...(modifyButton?.({ type: 'addGroup', depth: currentNode.depth }) || {}),
    };

    return (
      <div
        key={currentKey}
        className={cx(
          'relation-container',
          `index-${indexParams.index}`,
          `id-${currentKey}`,
        )}
      >
        <div className={cx('relation-node', `relation-node-${id}`)}>
          <div
            className={cx(
              'relation',
              {
                'root-relation': isRoot,
              },
              `index-${indexParams.index}`,
              {
                'index-latest': indexParams.index === indexParams.length - 1,
                'index-first': indexParams.index === 0,
              },
            )}
          >
            <RelationDragItem
              key={currentNode.key + '-relation'}
              thisKey={currentNode.key}
              onMove={onMove}
              namePath={currentNode.namePath}
              disabled={rowConfig.disabled}
              rowConfig={rowConfig}
              nodeType={'RELATION'}
              collapse={true}
              toggleCollapse={() => {}}
              collapsible={false}
              currentIndex={indexParams.index}
              dragger={
                <HolderOutlined
                  className={`${prefixCls}-action-drag`}
                  style={{ color: '#595959' }}
                />
              }
            >
              <Form.Field
                name={relationNamePath}
                initialValue={currentNode.data.relation}
              >
                {(props) => {
                  const relationElement =
                    typeof relationRender === 'function'
                      ? relationRender({
                          depth: currentNode.depth,
                          parent: currentNode.parent?.data,
                          brothers: currentNode.parent?.children
                            .filter((_child) => _child.key !== currentNode.key)
                            .map((_child) => ({ ..._child.data })),
                          isRoot,
                          data: treeInstance.getChildrenData(currentNode),
                        })
                      : relationRender;
                  return (
                    <RelationElement
                      value={props.value}
                      onChange={props.onChange}
                      rowConfig={rowConfig}
                    >
                      {relationElement}
                    </RelationElement>
                  );
                }}
              </Form.Field>
              {rowConfig.removable && !isRoot && (
                <div style={{ paddingRight: 4 }}>
                  <DeleteFilled
                    onClick={() => {
                      if (rowConfig.disabled) {
                        return;
                      }
                      handleRemove(currentNode.key);
                    }}
                    style={{
                      cursor: rowConfig.disabled ? 'not-allowed' : 'pointer',
                      color: '#888',
                    }}
                  />
                </div>
              )}
            </RelationDragItem>
          </div>
        </div>
        <div className="relation-children">
          <div
            className={cx('relation-line', `relation-line-${id}`)}
            data-namepath={currentNode.namePath.join(',')}
          />
          {children.map((child: Node<any>, index) => {
            return (
              <React.Fragment key={currentKey + index}>
                {index === 0 && (
                  <DropPlacement
                    key={currentKey + index + 'dp'}
                    order={index}
                    parentKey={currentNode.key}
                    parentNamePath={currentNode.namePath}
                    relatedKeys={
                      index > 0
                        ? [
                            child.key,
                            child.parent?.key,
                            children[index - 1].key,
                          ]
                        : [child.key, child.parent?.key]
                    }
                  >
                    <div className="drop-inner" />
                  </DropPlacement>
                )}
                {render(
                  child,
                  {
                    index,
                    length: children.length,
                  },
                  this.props.mapKey,
                )}
                <DropPlacement
                  key={currentKey + index + 1 + 'dp'}
                  order={index + 1}
                  parentNamePath={currentNode.namePath}
                  parentKey={currentNode.key}
                  relatedKeys={[child.key, child.parent?.key]}
                >
                  <div className="drop-inner" />
                </DropPlacement>
              </React.Fragment>
            );
          })}
          <div className="button">
            <div
              onClick={() => {
                if (addRuleButtonConfig.disabled) {
                  return;
                }
                handleAdd(currentNode.key, 'FIELD');
              }}
              className={cx('button-add', 'button-add-rule', {
                disabled: addRuleButtonConfig.disabled,
              })}
            >
              <PlusOutlined />
              {addRuleButtonConfig.text}
            </div>
            <div
              onClick={() => {
                if (addRuleGroupButtonConfig.disabled) {
                  return;
                }
                handleAdd(currentNode.key, 'RELATION');
              }}
              className={cx('button-add', 'button-add-rule-group', {
                disabled: addRuleGroupButtonConfig.disabled,
              })}
            >
              {addRuleGroupButtonConfig.text}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export { TreeRelation };
