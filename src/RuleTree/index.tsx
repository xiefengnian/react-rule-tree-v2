import React, { useContext, useEffect, useRef, useState } from 'react';
import type { ButtonSize } from 'antd/es/button';
import { Tree } from './tree';
import useMergedState from 'rc-util/lib/hooks/useMergedState';
import type {
  Node as TreeNodeType,
  RuleTreeProps,
  IndexParams,
  Relation,
  Field,
  RowConfig,
  NodeType,
  ActionType,
} from './type';
import Form from 'rc-field-form';
import { Provider } from './components/Provider';
import { RELATION } from './constants';
import _ from 'lodash';
import { createCurrentKey, drawSvgFromTreeInstance, resetFields } from './utils';
import { useDrawLine } from './hooks/useDrawLine';
import { TreeField } from './components/TreeField';
import { TreeRelation } from './components/TreeRelation';
import { css, cx, getRuleTreeToken } from './style';
import type { BaseDesignToken } from './style/TokenProvider';
import { RuleTreeContext, RuleTreeProvider } from './style/TokenProvider';

export interface FooProps {
  size?: ButtonSize;
  children?: React.ReactNode;
}

const defaultRelationRender = () => {
  return (
    <select>
      <option value="and">并且</option>
      <option value="or">或者</option>
    </select>
  );
};

const RuleTree: React.FC<
  RuleTreeProps & {
    onChange?: (value: Record<any, any>) => void;
    value?: Record<any, any>;
    id?: string;
  }
> = ({
  value: propsValue,
  onChange: propsOnChange,
  relationRender = defaultRelationRender,
  fields,
  onCascade,
  cascades,
  noDndProvider = false,
  onRemove,
  defaultValue,
  modifyTreeNode,
  defaultRelationValue = 'and',
  id = 'default-rule-tree',
  style,
  actionRef,
  actionsRender,
  modifyButton,
}) => {
  const [form] = Form.useForm();

  const basicToken = useContext(RuleTreeContext);

  const fieldKeys: string[] = fields.map((item) => item.name);

  const [value, onChange] = useMergedState(defaultValue!, {
    value: propsValue,
    onChange: propsOnChange,
  });

  const treeRef = useRef<Tree>(Tree.initWithData(value, false, fieldKeys));

  const [__key, _setKey] = useState(0);

  const update = () => _setKey((_key) => _key + 1);

  useEffect(() => {
    resetFields(form, value);
    drawSvgFromTreeInstance(treeRef.current);
  }, [__key]);

  const setTree = (treeInstance: Tree) => {
    treeRef.current = treeInstance;
    update();
  };

  const internalActionRef = useRef<ActionType>({
    validate: () => form.validateFields(),
    setData: (key, data) => {
      const node = treeRef.current?.find('key', key);
      if (!node) return;
      node.data = data;
      onChange?.(treeRef.current?.getPureData());
    },
    reRender: () => {
      update();
    },
  });

  if (actionRef) {
    _.set(actionRef, 'current', internalActionRef.current);
  }

  const createInitialValue = () =>
    fields.reduce((memo, field) => {
      const { initialValue, name } = field;
      return _.merge(memo, { [name]: initialValue });
    }, {});

  const handleAdd = (key: number, type: NodeType) => {
    const fieldInitialValue = createInitialValue();

    const newTree = Tree.getNewInstance(treeRef.current);

    const node = newTree.createNode(
      type === 'RELATION' ? { relation: defaultRelationValue } : fieldInitialValue,
      type,
    );
    newTree.appendByKey(key, node);
    if (type === RELATION) {
      const autoField = newTree.createNode(fieldInitialValue, 'FIELD');
      newTree.appendByKey(node.key, autoField);
    }
    onChange?.(newTree.getPureData());
  };

  /**
   *
   * @param key 删除的节点 key
   * @param currentTreeInstance 递归删除时反复创建的新的树实例会有问题，使用参数传递
   * @param removeFromInternal 内部移动等导致的删除不受 onRemove 影响
   * @returns
   */
  const handleRemove = (key: number, currentTreeInstance?: Tree, removeFromInternal?: boolean) => {
    const newTree = currentTreeInstance || Tree.getNewInstance(treeRef.current);

    const node = newTree.find('key', key);

    if (onRemove && !removeFromInternal) {
      const shouldRemove = onRemove(node.type as Relation | Field, node.namePath, node.data);
      if (!shouldRemove) return;
    }

    const { parent } = node;
    newTree.removeByKey(key);

    if (!newTree.isRoot(parent) && parent.children.length === 0) {
      handleRemove(parent.key, newTree, removeFromInternal);
    } else {
      onChange?.(newTree.getPureData());
    }
  };

  const handleCopy = (key: number) => {
    const newTree = Tree.getNewInstance(treeRef.current);

    const node = newTree.find('key', key);
    if (node) {
      const { data, parent } = node;
      const newNode = newTree.createNode(_.clone(data), 'FIELD');
      newTree.appendByKey(parent.key, newNode);
      onChange?.(newTree.getPureData());
    }
  };

  const onMove = (fromKey: number, toKey: number, order: number, originOrder: number) => {
    const newTree = Tree.getNewInstance(treeRef.current);
    const fromNode = newTree.find('key', fromKey);

    const parentNode = fromNode.parent;
    const toNode = newTree.find('key', toKey);

    if (toNode.namePath.length !== fromNode.namePath.length - 1) {
      newTree.move(fromKey, toKey, originOrder);
    } else {
      // 如果是同层级移动
      newTree.move(fromKey, toKey, order);
    }

    if (parentNode.type === RELATION && parentNode.children.length === 0) {
      handleRemove(parentNode.key, newTree, true);
    } else {
      onChange?.(newTree.getPureData());
    }
  };

  useDrawLine();

  useEffect(() => {
    if (value) {
      setTree(Tree.initWithData(value, false, fieldKeys));
    }
  }, [value]);

  const render = (
    currentNode: TreeNodeType<any>,
    indexParams: IndexParams = { index: 0, length: 0 },
    mapKey: string,
  ) => {
    const currentKey = createCurrentKey(currentNode.namePath);

    let rowConfig: RowConfig = {
      copyable: false,
      draggable: true,
      disabled: false,
      removable: currentNode.type === 'FIELD',
      className: '',
    };

    const isRoot = treeRef.current.isRoot(currentNode);

    if (modifyTreeNode) {
      rowConfig = {
        ...rowConfig,
        ...modifyTreeNode({
          type: currentNode.type,
          namePath: currentNode.namePath,
          data: currentNode.data,
          isRoot,
        }),
      };
    }

    if (currentNode.type === 'RELATION') {
      return (
        <TreeRelation
          mapKey={mapKey}
          nodeKey={currentNode.key}
          key={currentKey}
          render={render}
          currentKey={currentKey}
          currentNode={currentNode}
          isRoot={isRoot}
          rowConfig={rowConfig}
          indexParams={indexParams}
          id={id}
          onMove={onMove}
          treeInstance={treeRef.current}
          handleAdd={handleAdd}
          relationRender={relationRender}
          modifyButton={modifyButton}
          handleRemove={handleRemove}
        />
      );
    } else if (currentNode.type === 'FIELD') {
      return (
        <TreeField
          key={currentKey}
          form={form}
          fields={fields}
          onMove={onMove}
          cascades={cascades}
          onCascade={onCascade}
          rowConfig={rowConfig}
          handleCopy={handleCopy}
          handleRemove={handleRemove}
          currentKey={currentKey}
          currentNode={currentNode}
          indexParams={indexParams}
          actionsRender={actionsRender}
        />
      );
    }
  };

  return (
    <div
      className={cx(
        'rule-tree',
        getRuleTreeToken(basicToken as BaseDesignToken),
        css('position: relative;'),
      )}
      style={style}
    >
      <Provider noDndProvider={noDndProvider}>
        <svg id="svg-drag" />
        <Form
          form={form}
          component="div"
          onValuesChange={(changeValues, values) => {
            treeRef.current?.bfs(treeRef.current?.getRoot(), (node) => {
              if (_.isEqual(node.namePath, [])) {
                _.set(node, 'data.relation', values.relation);
              } else {
                _.set(node, `data`, {
                  ...values[node.namePath.join('.')],
                  ...(node.type === RELATION
                    ? {
                        children: node.data.children,
                      }
                    : {}),
                });
              }
            });
            onChange?.(treeRef.current.getPureData());
          }}
        >
          {render(treeRef.current.getRoot(), undefined, treeRef.current.getCurrentMap())}
        </Form>
      </Provider>
    </div>
  );
};

const RuleTreeWrapper = (
  props: RuleTreeProps & {
    token?: any;
    onChange?: (value: any) => void;
    value?: Record<any, any>;
    id?: string;
  },
) => {
  return (
    <RuleTreeProvider token={props?.token}>
      <RuleTree {...props} />
    </RuleTreeProvider>
  );
};

export default RuleTreeWrapper;
