import { CopyFilled, DeleteFilled, HolderOutlined } from '@ant-design/icons';
import cx from 'classnames';
import type { FormInstance } from 'rc-field-form';
import Form from 'rc-field-form';
import React, { Component } from 'react';
import { prefixCls } from '../constants';
import type {
  AnyFunction,
  Fields,
  IndexParams,
  Node,
  RenderContext,
  RowConfig,
  RuleTreeProps,
} from '../type';
import type { DragItemProps } from './DragItem';
import { DragItem } from './DragItem';
import { Space } from './compatible/Space';

export type ReactPropsTypeWithChildren = {
  children?: React.ReactNode;
};

type TreeFieldProps = Pick<
  RuleTreeProps,
  'actionsRender' | 'fields' | 'cascades' | 'onCascade'
> & {
  rowConfig: RowConfig;
  handleCopy: AnyFunction;
  handleRemove: AnyFunction;
  onMove: DragItemProps['onMove'];
  currentNode: Node<any>;
  currentKey: string;
  form: FormInstance;
  indexParams: IndexParams;
};

type FieldElementProps = {
  value: any;
  onChange: any;
  fieldError: string[];
  namePath: string[];
  rowConfig: RowConfig;
} & ReactPropsTypeWithChildren;

class FieldElement extends Component<FieldElementProps> {
  shouldComponentUpdate(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    nextProps: Readonly<FieldElementProps>,
  ): boolean {
    // 暂时关闭，后面做性能优化
    // fieldError 要及时感知
    // if (!_.isEqual(this.props.fieldError, nextProps.fieldError)) {
    //   return true;
    // }

    // if (this.props.value === nextProps.value) {
    //   return false;
    // }
    return true;
  }
  render(): React.ReactNode {
    const {
      children: fieldElement,
      value,
      onChange,
      rowConfig,
      fieldError,
      namePath,
    } = this.props;

    return React.cloneElement(fieldElement as React.ReactElement, {
      ...(fieldElement as React.ReactElement).props,
      ...{
        value,
        onChange,
      },
      ...{
        disabled: rowConfig.disabled,
        fieldError: fieldError,
        status: fieldError.length > 0 ? 'error' : undefined,
      },
      key: `field-component-${namePath.join('-')}`,
    });
  }
}

type FieldComponentProps = Pick<
  TreeFieldProps,
  'currentKey' | 'currentNode' | 'form' | 'rowConfig'
> & {
  name: Fields[0]['name'];
  render: AnyFunction;
  indexParams: IndexParams;
  rules?: Fields[0]['rules'];
} & Pick<RuleTreeProps, 'cascades' | 'onCascade'>;

class FieldComponent extends Component<FieldComponentProps> {
  shouldComponentUpdate(): boolean {
    return true;
  }
  getNamePath = () => {
    const { currentNode, name } = this.props;
    const namePath = [currentNode.namePath.join('.')].concat(name);
    return namePath;
  };
  render(): React.ReactNode {
    const {
      form,
      currentKey,
      currentNode,
      indexParams,
      render,
      rules,
      onCascade,
      cascades,
      name,
      rowConfig,
    } = this.props;
    const namePath = this.getNamePath();
    const context: RenderContext = {
      getFieldError: () => {
        return form.getFieldError(namePath);
      },
      getFieldValue: (ctxName: string) => {
        return form.getFieldValue(
          [currentNode.namePath.join('.')].concat(ctxName),
        );
      },
      setFieldValue: (_name, _value) => {
        form.setFields([
          {
            name: [currentNode.namePath.join('.')].concat(_name),
            value: _value,
          },
        ]);
      },
    };

    const fieldElement = render(context, currentNode, {
      index: indexParams.index,
      length: indexParams.length,
    });

    const isValidElement = React.isValidElement(fieldElement);

    if (fieldElement === false) {
      return fieldElement;
    }

    if (!isValidElement) {
      console.error(
        '错误的 field 渲染，请使用 React.FC<{value:any;onChange:any}> 类型作为 field 的 render 返回值',
      );
      return fieldElement;
    }

    return (
      <div>
        <Form.Field
          name={namePath}
          key={`field-${currentKey}-${name}`}
          rules={rules}
        >
          {(props) => {
            const cascadesOnChange = (_props: any) => {
              props.onChange?.(_props); // onChange 必须在前，否则 onCascade 的值会延迟一次 onChange
              if (onCascade && cascades?.includes(name)) {
                onCascade(context, name);
                props.onChange?.(_props); // 如果在 onCascade 设置了 field，需要重新 onChange 一下 filed
              }
            };

            const fieldError = form.getFieldError(namePath);

            return (
              <FieldElement
                value={props.value}
                namePath={namePath}
                onChange={cascadesOnChange}
                fieldError={fieldError}
                rowConfig={rowConfig}
              >
                {fieldElement}
              </FieldElement>
            );
          }}
        </Form.Field>
      </div>
    );
  }
}

class TreeField extends Component<TreeFieldProps> {
  shouldComponentUpdate(): boolean {
    return true;
  }

  render(): React.ReactNode {
    const {
      rowConfig,
      handleCopy,
      handleRemove,
      currentKey,
      currentNode,
      actionsRender,
      indexParams,
      onMove,
      fields,
      form,
      cascades,
      onCascade,
    } = this.props;

    const hasAllow =
      // @ts-ignore
      Object.keys(rowConfig).filter((key) => rowConfig[key]).length > 0;

    const onCopy = () => {
      if (rowConfig.disabled) {
        return;
      }
      handleCopy(currentNode.key);
    };

    const onRemove = () => {
      if (rowConfig.disabled) {
        return;
      }
      handleRemove(currentNode.key);
    };

    let copyElement = (
      <CopyFilled
        className={`${prefixCls}-action-copy`}
        onClick={onCopy}
        style={{
          cursor: rowConfig.disabled ? 'not-allowed' : 'pointer',
          color: '#888888',
        }}
      />
    );

    let removeElement = (
      <DeleteFilled
        className={`${prefixCls}-action-remove`}
        onClick={onRemove}
        style={{
          cursor: rowConfig.disabled ? 'not-allowed' : 'pointer',
          color: '#888888',
        }}
      />
    );

    if (actionsRender) {
      const { remove: customRemoveElement, copy: customCopyElement } =
        actionsRender(
          {
            // @ts-ignore
            type: this.props.children?.type,
            namePath: currentNode.namePath,
            isRoot: !currentNode.parent,
            data: currentNode.data,
            disabled: rowConfig.disabled || false,
          },
          {
            remove: onRemove,
            copy: onCopy,
          },
        );
      if (customRemoveElement) {
        removeElement = customRemoveElement;
      }
      if (customCopyElement) {
        copyElement = customCopyElement;
      }
    }

    return (
      <div
        key={currentKey}
        className={cx(
          'field',
          `index-${indexParams.index}`,
          {
            'index-latest': indexParams.index === indexParams.length - 1,
            'index-first': indexParams.index === 0,
          },
          `id-${currentKey}`,
        )}
      >
        <DragItem
          key={currentNode.key + '-field'}
          thisKey={currentNode.key}
          onMove={onMove}
          namePath={currentNode.namePath}
          disabled={rowConfig.disabled}
          rowConfig={rowConfig}
          nodeType={'FIELD'}
          currentIndex={indexParams.index}
          dragger={
            <HolderOutlined
              className={`${prefixCls}-action-drag`}
              style={{ color: '#595959' }}
            />
          }
        >
          <div className="field-content">
            <Space>
              {fields.map((props) => {
                return (
                  <FieldComponent
                    {...props}
                    key={`field-${currentKey}-${props.name}-container`}
                    currentKey={currentKey}
                    currentNode={currentNode}
                    rowConfig={rowConfig}
                    form={form}
                    indexParams={indexParams}
                    cascades={cascades}
                    onCascade={onCascade}
                  />
                );
              })}
              {hasAllow && (
                <Space>
                  {rowConfig.copyable && copyElement}
                  {rowConfig.removable && removeElement}
                </Space>
              )}
            </Space>
          </div>
        </DragItem>
      </div>
    );
  }
}

export { TreeField };
