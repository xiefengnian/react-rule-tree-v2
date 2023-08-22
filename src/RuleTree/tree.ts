import _ from 'lodash';
import type { DFSCallBack, Node, NodeType, RenderOptions } from './type';

export class Tree<D = any> {
  private root: Node<D>;

  private nodes: Node<D>[] = [];

  private key: number = 0;

  private collapsible: boolean = false;

  constructor(
    data: D,
    type: NodeType,
    collapsible: boolean = false,
    rootPreserveData: Record<any, any>,
  ) {
    this.root = this.createNode(data, type, false, rootPreserveData);
    this.nodes.push(this.root);
    this.collapsible = collapsible;
  }

  /**
   * 判断是否根节点，可以优化代码语义
   * @param node 节点
   * @returns 是否根节点
   */
  isRoot(node: Node<D>) {
    return node === this.root;
  }
  getRoot() {
    return this.root;
  }

  /**
   * 切换关系节点的折叠状态
   * @param key 节点 key
   */
  toggleCollapse(key: number) {
    const node = this.findByKey(key);
    node.collapse = !node.collapse;
  }

  /**
   * 遍历所有父节点判断其是否需要折叠
   * @param key 节点 key
   */
  shouldCollapse(key: number) {
    const node = this.findByKey(key);
    let result = node.collapse;
    let tmp = node;
    while (tmp.parent) {
      // 一旦其某个父节点处于折叠状态，其自身必须折叠
      if (tmp.parent.collapse) {
        result = true;
        break;
      }
      tmp = tmp.parent;
    }
    return result;
  }

  /**
   * 创建节点，节点和数据分离，数据将携带在节点的data字段中
   * @param data 数据内容
   * @returns 一个新的节点
   */
  createNode(
    data: D,
    type: NodeType,
    collapse: boolean = false,
    preserveData: Record<any, any> = {},
  ): Node<D> {
    this.key += 1;
    return {
      data,
      // @ts-ignore
      parent: undefined,
      // @ts-ignore
      children: undefined,
      key: this.key - 1,
      depth: this.root ? NaN : 0,
      height: NaN,
      type,
      namePath: [],
      collapse: collapse,
      preserveData: preserveData,
    };
  }

  /**
   * 深度优先遍历
   * @param node 遍历的开始节点
   * @param cb 观察函数
   */
  dfs(node: Node<D>, cb: DFSCallBack<Node<D>>) {
    if (node.children) {
      node.children.forEach((n) => {
        this.dfs(n, cb);
        cb(n);
      });
    }
    cb(node);
  }

  /**
   * 广度优先遍历
   * @param node 遍历开始的节点
   * @param cb 观察函数
   */
  bfs(node: Node<D>, cb: DFSCallBack<Node<D>>) {
    cb(node);
    if (node.children) {
      node.children.forEach((n) => {
        this.bfs(n, cb);
      });
    }
  }

  /**
   * 寻找节点
   * @param key 查找的字段（这个 key 的含义不是节点的 key 属性）
   * @param value 查找的值
   * @returns 返回找到的节点，没有找到时为 undefined
   */
  find(key: any, value: any): Node<D> {
    let result: Node<any>;
    this.bfs(this.root, (node) => {
      if (node[key] === value) {
        result = node;
      }
    });
    return result!;
  }

  findByKey(key: number): Node<D> {
    return this.nodes.find((node) => node.key === key)!;
  }

  /**
   * 添加节点到根节点
   * @param child 节点
   */
  appendToRoot(child: Node<D>) {
    const parentKey = this.root.key;
    this.appendByKey(parentKey, child);
  }

  /**
   * 添加节点
   * @param parentKey 添加到对应 key 的节点
   * @param child 节点
   * @param order 添加到节点时的顺序
   * @returns 添加成功返回根节点，否则返回false
   */
  appendByKey(parentKey: number, child: Node<D>, order?: number) {
    const parent = this.find('key', parentKey);
    if (!parent) return false;
    if (!parent.children) {
      parent.children = [];
    }
    Object.assign(child, { parent });
    Object.assign(child, { depth: parent.depth + 1 });

    if (child.children) {
      this.bfs(child, (node) => {
        if (node !== child) {
          this.nodes.push(node);
          Object.assign(node, { depth: node.parent.depth + 1 });
        }
      });
    }
    if (order?.toString()) {
      parent.children.splice(order, 0, child);
    } else {
      parent.children.push(child);
    }

    // 创建时直接构建 namePath
    Object.assign(child, {
      namePath: parent.namePath.slice().concat(_.indexOf(parent.children, child).toString()),
    });

    this.nodes.push(child);
    return this.root;
  }

  /**
   * 在树中删除节点
   * @param childKey 删除的节点的 key
   * @returns 返回删除的节点
   */
  removeByKey(childKey: number) {
    let removedRoot;
    const childNode = this.find('key', childKey);
    if (!childNode) {
      return removedRoot;
    }
    const { parent } = childNode;
    parent.children.forEach((child, index) => {
      if (child.key === childKey) {
        removedRoot = parent.children.splice(index, 1);
      }
    });
    if (!removedRoot) {
      throw new Error('cant found removed root');
    }
    const removedKey: number[] = [];
    this.bfs(removedRoot[0], (node) => {
      removedKey.push(node.key);
    });
    this.nodes = this.nodes.filter((n) => !removedKey.includes(n.key));
    return removedRoot;
  }

  /**
   * 移动节点
   * @param fromKey 移动的节点 key
   * @param toKey 移动到的节点 key
   * @param order 移动的新的节点的顺序
   * @returns 移动结果
   */
  move(fromKey: number, toKey: number, order?: number) {
    const fromNode = this.removeByKey(fromKey);
    if (!fromNode) return false;
    const result = this.appendByKey(toKey, fromNode[0], order);
    return !!result;
  }

  /**
   * 渲染方法
   * @param renderOptions 渲染设置
   */
  render(...renderOptions: RenderOptions<D>[]) {
    renderOptions.forEach((option) => {
      const { order, renderFunction } = option;
      if (order === 'dfs') {
        this.dfs(this.root, renderFunction);
      } else {
        this.bfs(this.root, renderFunction);
      }
    });
  }

  /**
   * 获取纯数据（不包含渲染所需的数据）
   * @param startNode 从某个节点开始获取
   * @returns 纯数据
   */
  getChildrenData(startNode: Node<D>) {
    const fn = (node: Node<D>) => {
      const obj = {};
      const { data, children, collapse, type, preserveData } = node;
      Object.assign(obj, data);
      Object.assign(obj, preserveData);
      if (type === 'RELATION' && this.collapsible) {
        Object.assign(obj, { collapse });
      }
      if (children) {
        const c: any[] = [];
        children.forEach((child) => {
          c.push(fn(child));
        });
        Object.assign(obj, { children: c });
      }
      return obj;
    };

    return fn(startNode);
  }

  /**
   * 获取全部纯数据（不包含渲染所需的数据）
   * @returns 纯数据
   */
  getPureData() {
    return this.getChildrenData(this.root);
  }

  /**
   * 从数据初始化树
   * @param data 初始化的数据
   * @param format 整理数据的方法
   * @returns 用于渲染的树实例
   */
  static initWithData(data: any, collapsible: boolean, fieldKeys: string[]) {
    const renderData = data;
    if (!data) {
      throw new Error(
        `无数据或数据非对象，请使用 FormItem.initialValue | FormInstance.setFiledValue | defaultValue 等方式初始化数据，当前值为 ${data}`,
      );
    }
    if (!renderData.hasOwnProperty('relation')) {
      throw new Error(
        `数据必须包含 relation 字段，例如 { relation: "and" }，当前数据为：\n${JSON.stringify(
          data,
          undefined,
          2,
        )}`,
      );
    }

    const rootPreserveData = _.omit(renderData, ['relation', 'children']);

    const tree = new Tree<any>(
      { relation: renderData.relation },
      'RELATION',
      collapsible,
      rootPreserveData,
    );
    const init = (parentKey: number, initData: Record<any, any>) => {
      const { children } = initData;
      children?.forEach((childData: any) => {
        const isRelation = childData.hasOwnProperty('relation');
        let childNode = null;
        if (isRelation) {
          const preserveData = _.omit(childData, ['relation', 'children']);
          const fieldData = _.pick(childData, ['relation']);
          childNode = tree.createNode(
            { ...fieldData },
            'RELATION',
            childData.collapse,
            preserveData,
          );
        } else {
          const preserveData = _.omit(childData, fieldKeys);
          const fieldData = _.pick(childData, fieldKeys);
          childNode = tree.createNode({ ...fieldData }, 'FIELD', childData.collapse, preserveData);
        }
        tree.appendByKey(parentKey, childNode);
        if (childData.children) {
          init(childNode.key, childData);
        }
      });
    };
    init(tree.getRoot().key, renderData);

    return _.cloneDeep(tree);
  }

  /**
   * 获得节点的最后节点距离左侧的距离
   * @returns {number} maxLeft
   */
  getMaxLeft() {
    const nodes = this.nodes;
    let maxLeft = 0;
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (!maxLeft || node.position!.x > maxLeft) {
        maxLeft = node.position!.x!;
      }
    }
    return maxLeft;
  }

  // 为了完全受控，每次生成新树提供给 onChange，随后从 value 中重新初始化树
  static getNewInstance = (oldTree: Tree) => {
    return _.cloneDeep(oldTree);
  };

  /**
   * 获取当前结构的指纹，用于 React shouldUpdate
   * @returns {string} mapKey
   */
  getCurrentMap = () => {
    const data: any = this.getPureData();
    const keys: string[] = [];
    const fn = (currentData: any, depth: number) => {
      const id = Object.keys(currentData).join('-');
      if (!keys[depth]) {
        keys[depth] = ``;
      }
      keys[depth] += `${id}_`;
      if (currentData.children && Array.isArray(currentData.children)) {
        currentData.children.forEach((item) => {
          fn(item, depth + 1);
        });
      }
    };
    fn(data, 0);
    return keys.join('/');
  };
}
