import type { Rule } from 'rc-field-form/lib/interface';
import type React from 'react';
import type { MutableRefObject } from 'react';

export interface ItemType {
  name: string;
}

export type BoxType = {
  key: number;
  name: string;
};

export type EndDrop = {
  order: number;
  targetOrder: number;
};

export type Relation = 'RELATION';
export type Field = 'FIELD';
export type Button = 'BUTTON';

export type NodeType = Relation | Field | Button;

export type Node<D> = {
  data: D;
  children: Node<D>[];
  parent: Node<D>;
  key: number;
  depth: number;
  position?: {
    x: number;
    y: number;
  };
  height: number;
  namePath: string[];
  type: NodeType;
  collapse: boolean;
  preserveData: Record<any, any>;
  [key: string]: any;
};
export type DFSCallBack<T> = (node: T) => void;

export type TreeData = {
  relation: 'and' | 'or';
  key: number;
  children: TreeData | Field;
};

export type RenderOptions<D = any> = {
  order: 'dfs' | 'bfs';
  renderFunction: DFSCallBack<Node<D>>;
};

export type RenderContext = {
  getFieldValue: (name: string) => any;
  setFieldValue: (name: string, value: any) => void;
  getFieldError: () => string[];
};

type FieldCurrent = {
  index: number;
  length: number;
};

export type Fields = {
  name: string;
  rules?: Rule[];
  initialValue?: any;
  /** render 请勿使用 ()=> (value,onChange)=> React.ReactNode; 的语法, 复杂组件请使用 ()=>\<YourComponent /\>; 进行封装。 */
  render: (ctx: RenderContext, node: Node<any>, current: FieldCurrent) => React.ReactNode;
}[];

export type CreateDragItem<D = any> = (props: {
  data: D;
  onDragEnd?: (data: D) => void;
  render: (data: D) => React.ReactElement;
}) => void;

export type CanAndRuleProps = {
  depth: number;
  parent: Record<string, any>;
  brothers: Record<string, any>[];
};

export type ActionType = {
  validate: () => Promise<any>;
  setData: (key: number, data: Record<string, any>) => void;
  reRender: () => void;
};

export type FocusContext = {
  getData: () => Record<string, any>;
  getKey: () => number;
};

export type RelationRenderProps = CanAndRuleProps & {
  data: Record<string, any>;
  isRoot: boolean;
};

export type RowConfig = {
  draggable?: boolean;
  copyable?: boolean;
  removable?: boolean;
  className?: string;
  disabled?: boolean;
};

export type CurrentRow = { index: number; length: number; data: Record<any, any> };

export type CurrentNode = {
  type: Relation | Field | any;
  namePath: string[];
  data: Record<any, any>;
  isRoot: boolean;
};

export type ButtonConfig = {
  disabled: boolean;
  text: string;
};

export type CurrentButton = {
  type: 'add' | 'addGroup';
  depth: number;
};

// 需要透出的token结构
export type RuleTreeToken = {};

export type RuleTreeProps = {
  fields: Fields;
  style?: React.CSSProperties;
  token?: RuleTreeToken;
  readonly?: boolean;
  relationRender?:
    | React.ReactElement
    | ((relationRenderProps: RelationRenderProps) => React.ReactElement);
  defaultRelationValue?: any;
  cascades?: string[];
  actionRef?: MutableRefObject<ActionType | undefined>;
  onCascade?: (ctx: RenderContext, changedField?: string) => void;
  extraDragItemRender?: (createDragItem: CreateDragItem) => React.ReactElement;
  canAddRule?: (props: CanAndRuleProps) => boolean | 'hide';
  canAddRuleGroup?: (node: CanAndRuleProps) => boolean | 'hide';
  description?: React.ReactNode;
  defaultValue?: Record<string, any>;
  onFieldFocus?: (key: number, name: string, value: string, fieldsData: Record<any, any>) => void;
  noDndProvider?: boolean;
  modifyTreeNode?: (currentNode: CurrentNode) => RowConfig;
  modifyButton?: (currentButton: CurrentButton) => Partial<ButtonConfig>;
  actionsRender?: (
    currentNode: CurrentNode & { disabled: boolean },
    actions: {
      remove: Function;
      copy: Function;
    },
  ) => {
    remove?: React.ReactElement;
    copy?: React.ReactElement;
  };
  onRemove?: (type: Relation | Field, namePath: string[], data: Record<any, any>) => boolean;
};

export type IndexParams = {
  index: number;
  length: number;
};
