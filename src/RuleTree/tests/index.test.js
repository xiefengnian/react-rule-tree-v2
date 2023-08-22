import { Form, Input, Select } from 'antd';
import { mount } from 'enzyme';
import React from 'react';
import { waitForComponentToPaint } from '../../../tests/util';
import RuleTree from '../../index';

describe('👻 正常使用', () => {
  it('🥳 渲染', async () => {
    const html = mount(
      <Form>
        <Form.Item
          name="rule"
          initialValue={{
            relation: 'or',
            children: [
              {
                name: '123',
                sex: '0',
              },
              {
                relation: 'and',
                children: [
                  {
                    name: 'lululu',
                    sex: '1',
                  },
                ],
              },
            ],
          }}
        >
          <RuleTree
            fields={[
              {
                name: 'name',
                rules: [
                  {
                    required: true,
                  },
                ],
                render: () => {
                  return <Input style={{ height: 32 }} />;
                },
              },
              {
                name: 'sex',
                initialValue: '0',
                render: () => {
                  return (
                    <Select>
                      <Select.Option value="0">男</Select.Option>
                      <Select.Option value="1">女</Select.Option>
                    </Select>
                  );
                },
              },
            ]}
            relation={
              <Select>
                <Select.Option value="and">and</Select.Option>
                <Select.Option value="or">or</Select.Option>
              </Select>
            }
          />
        </Form.Item>
      </Form>,
    );
    await waitForComponentToPaint(html, 1000);
    expect(html.find('.techui-rule-tree-node-container').length).toEqual(3);
    expect(html.find('.techui-rule-tree-node-button-group').length).toEqual(2);
    expect(html.find('.techui-rule-tree-node-root').length).toEqual(1);
    html.unmount();
  });
});

describe('👻 可添加的条件判断', () => {
  it('🥳 允许添加条件组但不允许添加条件', async () => {
    const html = mount(
      <Form>
        <Form.Item
          name="rule"
          initialValue={{
            relation: 'or',
            children: [
              {
                name: '123',
                sex: '0',
              },
              {
                relation: 'and',
                children: [
                  {
                    name: 'lululu',
                    sex: '1',
                  },
                ],
              },
            ],
          }}
        >
          <RuleTree
            fields={[
              {
                name: 'name',
                rules: [
                  {
                    required: true,
                  },
                ],
                render: () => {
                  return <Input style={{ height: 32 }} />;
                },
              },
              {
                name: 'sex',
                initialValue: '0',
                render: () => {
                  return (
                    <Select>
                      <Select.Option value="0">男</Select.Option>
                      <Select.Option value="1">女</Select.Option>
                    </Select>
                  );
                },
              },
            ]}
            relation={
              <Select>
                <Select.Option value="and">and</Select.Option>
                <Select.Option value="or">or</Select.Option>
              </Select>
            }
            canAddRule={() => false}
          />
        </Form.Item>
      </Form>,
    );
    await waitForComponentToPaint(html, 1000);
    expect(html.find('.techui-rule-tree-button-left').get(0).props.style.cursor).toEqual(
      'not-allowed',
    );
    expect(html.find('.techui-rule-tree-button-left').get(1).props.style.cursor).toEqual(
      'not-allowed',
    );
    expect(html.find('.techui-rule-tree-button-right').get(0).props.style.cursor).toEqual(
      'pointer',
    );
    expect(html.find('.techui-rule-tree-button-right').get(1).props.style.cursor).toEqual(
      'pointer',
    );
    html.unmount();
  });

  it('🥳 允许添加条件但允许不添加条件组', async () => {
    const html = mount(
      <Form>
        <Form.Item
          name="rule"
          initialValue={{
            relation: 'or',
            children: [
              {
                name: '123',
                sex: '0',
              },
              {
                relation: 'and',
                children: [
                  {
                    name: 'lululu',
                    sex: '1',
                  },
                ],
              },
            ],
          }}
        >
          <RuleTree
            fields={[
              {
                name: 'name',
                rules: [
                  {
                    required: true,
                  },
                ],
                render: () => {
                  return <Input style={{ height: 32 }} />;
                },
              },
              {
                name: 'sex',
                initialValue: '0',
                render: () => {
                  return (
                    <Select>
                      <Select.Option value="0">男</Select.Option>
                      <Select.Option value="1">女</Select.Option>
                    </Select>
                  );
                },
              },
            ]}
            relation={
              <Select>
                <Select.Option value="and">and</Select.Option>
                <Select.Option value="or">or</Select.Option>
              </Select>
            }
            canAddRuleGroup={() => false}
          />
        </Form.Item>
      </Form>,
    );
    await waitForComponentToPaint(html, 1000);
    expect(html.find('.techui-rule-tree-button-left').get(0).props.style.cursor).toEqual('pointer');
    expect(html.find('.techui-rule-tree-button-left').get(1).props.style.cursor).toEqual('pointer');
    expect(html.find('.techui-rule-tree-button-right').get(0).props.style.cursor).toEqual(
      'not-allowed',
    );
    expect(html.find('.techui-rule-tree-button-right').get(1).props.style.cursor).toEqual(
      'not-allowed',
    );
    html.unmount();
  });

  it('🥳 未渲染的 field 不需要校验', async () => {
    // 正常情况
    const notBeCalledMockFn = jest.fn();

    const Demo = () => {
      const ruleTreeRef = React.useRef();
      return (
        <Form
          id="form"
          onFinish={async () => {
            try {
              await ruleTreeRef.current.validate();
              notBeCalledMockFn();
            } catch (error) {}
          }}
        >
          <Form.Item
            name="rule"
            initialValue={{
              relation: 'or',
              children: [
                {
                  foo: 1,
                },
              ],
            }}
          >
            <RuleTree
              actionRef={ruleTreeRef}
              fields={[
                {
                  name: 'foo',
                  render: () => {
                    return <input />;
                  },
                },
                {
                  name: 'bar',
                  rules: [
                    {
                      required: true,
                    },
                  ],
                  render: () => {
                    return <input />;
                  },
                },
              ]}
              relation={
                <Select>
                  <Select.Option value="and">and</Select.Option>
                  <Select.Option value="or">or</Select.Option>
                </Select>
              }
            />
          </Form.Item>
        </Form>
      );
    };
    const component = mount(<Demo />);
    await waitForComponentToPaint(component, 1000);
    component.find('#form').at(1).simulate('submit');
    await waitForComponentToPaint(component, 1000);
    expect(notBeCalledMockFn.mock.calls.length).toEqual(0);
    component.unmount();

    // 不渲染field的情况
    const toBeCalledMockFn = jest.fn();

    const Demo2 = () => {
      const ruleTreeRef = React.useRef();
      return (
        <Form
          id="form"
          onFinish={async () => {
            await ruleTreeRef.current.validate();
            toBeCalledMockFn();
          }}
        >
          <Form.Item
            name="rule"
            initialValue={{
              relation: 'or',
              children: [
                {
                  foo: 1,
                },
              ],
            }}
          >
            <RuleTree
              actionRef={ruleTreeRef}
              fields={[
                {
                  name: 'foo',
                  render: () => {
                    return <input />;
                  },
                },
                {
                  name: 'bar',
                  rules: [
                    {
                      required: true,
                    },
                  ],
                  render: () => {
                    return false;
                  },
                },
              ]}
              relation={
                <Select>
                  <Select.Option value="and">and</Select.Option>
                  <Select.Option value="or">or</Select.Option>
                </Select>
              }
            />
          </Form.Item>
        </Form>
      );
    };

    const component2 = mount(<Demo2 />);
    await waitForComponentToPaint(component2, 1000);
    component2.find('#form').at(1).simulate('submit');
    await waitForComponentToPaint(component2, 1000);
    expect(toBeCalledMockFn.mock.calls.length).toEqual(1);

    component2.unmount();
  });
});

describe('👻 relation 渲染数据', () => {
  it('🥳 data 展示的数据正确', async () => {
    const getProps = jest.fn();
    const html = mount(
      <Form>
        <Form.Item
          name="rule"
          initialValue={{
            relation: 'or',
            children: [
              {
                name: '123',
                sex: '0',
              },
              {
                relation: 'and',
                children: [
                  {
                    name: 'lululu',
                    sex: '1',
                  },
                ],
              },
            ],
          }}
        >
          <RuleTree
            fields={[
              {
                name: 'name',
                rules: [
                  {
                    required: true,
                  },
                ],
                render: () => {
                  return <Input style={{ height: 32 }} />;
                },
              },
              {
                name: 'sex',
                initialValue: '0',
                render: () => {
                  return (
                    <Select>
                      <Select.Option value="0">男</Select.Option>
                      <Select.Option value="1">女</Select.Option>
                    </Select>
                  );
                },
              },
            ]}
            relation={(props) => {
              getProps(props);
              return (
                <Select>
                  <Select.Option value="and">and</Select.Option>
                  <Select.Option value="or">or</Select.Option>
                </Select>
              );
            }}
          />
        </Form.Item>
      </Form>,
    );
    await waitForComponentToPaint(html, 1000);
    expect(getProps.mock.calls[0][0].data).toEqual({
      relation: 'or',
      children: [
        {
          name: '123',
          sex: '0',
        },
        {
          relation: 'and',
          children: [
            {
              name: 'lululu',
              sex: '1',
            },
          ],
        },
      ],
    });
    expect(getProps.mock.calls[1][0].data).toEqual({
      relation: 'and',
      children: [
        {
          name: 'lululu',
          sex: '1',
        },
      ],
    });
    html.unmount();
  });
});

describe('👻 modify', () => {
  it('🥳 modify tree node should work fine', () => {
    const html = mount(
      <Form>
        <Form.Item
          name="rule"
          initialValue={{
            relation: 'or',
            children: [
              {
                name: '123',
                sex: '0',
              },
              {
                relation: 'and',
                children: [
                  {
                    name: 'lululu',
                    sex: '1',
                  },
                ],
              },
            ],
          }}
        >
          <RuleTree
            fields={[
              {
                name: 'name',
                rules: [
                  {
                    required: true,
                  },
                ],
                render: () => {
                  return <Input style={{ height: 32 }} />;
                },
              },
            ]}
            relation={
              <Select>
                <Select.Option value="and">and</Select.Option>
                <Select.Option value="or">or</Select.Option>
              </Select>
            }
            modifyTreeNode={({ namePath }) => {
              return {
                className: `test-class-${['0'].concat(namePath).join('-')}`,
                draggable: JSON.stringify(namePath) === `["0"]`,
                removable: JSON.stringify(namePath) === `["0"]`,
                copyable: namePath.length === 1,
              };
            }}
          />
        </Form.Item>
      </Form>,
    );
    // class name
    expect(html.find('.test-class-0').length).toEqual(1);
    expect(html.find('.test-class-0-0').length).toEqual(1);
    expect(html.find('.test-class-0-1').length).toEqual(1);
    expect(html.find('.test-class-0-2').length).toEqual(0);
    expect(html.find('.test-class-0-1-0').length).toEqual(1);

    // draggable
    expect(html.exists('.test-class-0-0 .techui-rule-tree-action-drag')).toBeTruthy();
    expect(html.exists('.test-class-0-1 .techui-rule-tree-action-drag')).toBeFalsy();
    expect(html.exists('.test-class-0-1-0 .techui-rule-tree-action-drag')).toBeFalsy();

    // removable
    expect(html.exists('.test-class-0-0 .anticon-delete')).toBeTruthy();
    expect(html.exists('.test-class-0-1 .anticon-delete')).toBeFalsy();
    expect(html.exists('.test-class-0-1-0 .anticon-delete')).toBeFalsy();

    // copyable
    expect(html.exists('.test-class-0-0 .techui-rule-tree-action-copy')).toBeTruthy();
    expect(html.exists('.test-class-0-1 .techui-rule-tree-action-copy')).toBeFalsy();
    expect(html.exists('.test-class-0-1-0 .techui-rule-tree-action-copy')).toBeFalsy();

    html.unmount();
  });
});

describe('👻 onRemove', () => {
  it('🥳 returns of onRemove should be effectively', async () => {
    const removeCallback = jest.fn();
    const onSubmit = jest.fn();
    const Demo = () => {
      const ruleTreeRef = React.useRef();
      const shouldRemoveRef = React.useRef(false);
      return (
        <Form
          id="form"
          onFinish={(values) => {
            onSubmit(values);
          }}
        >
          <Form.Item
            name="rule"
            initialValue={{
              relation: 'or',
              children: [
                {
                  foo: 1,
                },
              ],
            }}
          >
            <RuleTree
              actionRef={ruleTreeRef}
              fields={[
                {
                  name: 'foo',
                  render: () => {
                    return <input />;
                  },
                },
              ]}
              relation={
                <Select>
                  <Select.Option value="and">and</Select.Option>
                  <Select.Option value="or">or</Select.Option>
                </Select>
              }
              onRemove={(...props) => {
                removeCallback(props);
                return shouldRemoveRef.current;
              }}
            />
          </Form.Item>
          <button
            id="should_remove"
            onClick={() => {
              shouldRemoveRef.current = true;
            }}
          >
            should remove
          </button>
        </Form>
      );
    };
    const component = mount(<Demo />);
    component.find('#form span.techui-rule-tree-action-remove').simulate('click');
    expect(removeCallback.mock.calls[0][0]).toEqual(['FIELD', ['0'], { foo: 1 }]);
    component.find('form#form').simulate('submit');
    await waitForComponentToPaint(component, 1000);
    // 删除被拦截后，数据应当不变
    expect(onSubmit.mock.calls[0][0]).toEqual({
      rule: {
        relation: 'or',
        children: [
          {
            foo: 1,
          },
        ],
      },
    });

    // 切换为可删除
    component.find('button#should_remove').simulate('click');
    await waitForComponentToPaint(component, 1000);
    component.find('#form span.techui-rule-tree-action-remove').simulate('click');
    expect(removeCallback.mock.calls[1][0]).toEqual(['FIELD', ['0'], { foo: 1 }]);
    component.find('form#form').simulate('submit');
    await waitForComponentToPaint(component, 1000);
    // 删除后，数据变少
    expect(onSubmit.mock.calls[1][0]).toEqual({
      rule: {
        relation: 'or',
        children: [],
      },
    });
  });
});
