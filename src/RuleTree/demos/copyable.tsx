import ProCard from '@ant-design/pro-card';
import ProField from '@ant-design/pro-field';
import { Checkbox, Form, Input, Select } from 'antd';
import React, { useState } from 'react';
import RuleTree from 'react-rule-tree';

const { useForm } = Form;

const FiledCheckbox: React.FC<{ value?: any; onChange?: any }> = ({
  value,
  onChange,
}) => {
  return (
    <Checkbox
      checked={value}
      onChange={(e) => {
        onChange(e.target.checked);
      }}
    >
      {value ? '开启' : '关闭'}
    </Checkbox>
  );
};

export default () => {
  const [form] = useForm();
  const [value, setValue] = useState<Record<string, any>>({
    relation: 'or',
    children: [
      {
        name: '123',
        sex: '1',
      },
    ],
  });

  return (
    <>
      <div style={{ padding: '20px 50px', backgroundColor: 'white' }}>
        <Form
          form={form}
          onValuesChange={(changeValues, values) => {
            console.log(values);
            setValue(values);
          }}
        >
          <Form.Item label="规则树" name="rule" initialValue={value} required>
            <RuleTree
              fields={[
                {
                  name: 'name',
                  rules: [
                    {
                      required: true,
                    },
                  ],
                  initialValue: '',
                  render: () => {
                    return <Input style={{ height: 32 }} />;
                  },
                },
                {
                  name: 'check',
                  render: () => {
                    return <FiledCheckbox />;
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
              relationRender={({ isRoot }) => (
                <Select style={{ width: 80 }} bordered={isRoot}>
                  <Select.Option value="and">and</Select.Option>
                  <Select.Option value="or">or</Select.Option>
                </Select>
              )}
              modifyTreeNode={() => {
                return {
                  copyable: true,
                };
              }}
            />
          </Form.Item>
        </Form>
      </div>
      <ProCard>
        <ProField
          fieldProps={{
            style: {
              width: '100%',
            },
          }}
          mode="read"
          text={JSON.stringify(value)}
          valueType="jsonCode"
        />
      </ProCard>
    </>
  );
};
