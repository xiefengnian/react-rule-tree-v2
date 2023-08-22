import { Button, Form, Input, Select } from 'antd';
import React, { useRef } from 'react';
import type { ActionType } from 'react-rule-tree';
import RuleTree from 'react-rule-tree';

const { useForm } = Form;

export default () => {
  const [form] = useForm();

  const ruleTreeRef = useRef<ActionType>();

  return (
    <>
      <div style={{ padding: '20px 50px', backgroundColor: 'white' }}>
        <Form
          form={form}
          onFinish={async () => {
            try {
              await ruleTreeRef.current.validate();
            } catch (error) {
              console.log(error);
              ruleTreeRef.current.reRender();
            }
          }}
          onValuesChange={(changeValues, values) => {
            console.log('onValuesChange', values);
          }}
        >
          <Form.Item
            label="规则树"
            name="rule"
            initialValue={{
              relation: 'and',
              children: [{ name: '删掉我', sex: '0' }],
            }}
            required
          >
            <RuleTree
              actionRef={ruleTreeRef}
              fields={[
                {
                  name: 'name',
                  rules: [
                    {
                      required: true,
                      message: '必填项！',
                    },
                  ],
                  initialValue: '',
                  render: () => {
                    return <Input />;
                  },
                },
                {
                  name: 'sex',
                  initialValue: '0',
                  render: (ctx) => {
                    const name = ctx.getFieldValue('name');
                    if (name === '1024') {
                      return <div>ho!!</div>;
                    }
                    return (
                      <Select>
                        <Select.Option value="0">男</Select.Option>
                        <Select.Option value="1">女</Select.Option>
                      </Select>
                    );
                  },
                },
              ]}
              relationRender={({ isRoot }) => (
                <Select bordered={isRoot} style={{ width: 60 }}>
                  <Select.Option value="and">and</Select.Option>
                  <Select.Option value="or">or</Select.Option>
                </Select>
              )}
            />
          </Form.Item>
          <Button htmlType="submit">提交</Button>
        </Form>
      </div>
    </>
  );
};
