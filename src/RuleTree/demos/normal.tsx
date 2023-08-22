import ProCard from '@ant-design/pro-card';
import ProField from '@ant-design/pro-field';
import { Button, Checkbox, Form, Input, Select, Space } from 'antd';
import { useRef, useState } from 'react';
import type { ActionType } from 'react-rule-tree';
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
  const handleClick = () => {
    const newValue = {
      rule: {
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
                name: 'new name',
                sex: '1',
              },
            ],
          },
        ],
      },
    };
    form.setFieldsValue(newValue);
    setValue(newValue);
  };

  const ruleTreeRef = useRef<ActionType>();

  return (
    <>
      <div style={{ padding: '20px 50px', backgroundColor: 'white' }}>
        <Form
          form={form}
          onFinish={() => {
            ruleTreeRef.current.validate();
          }}
          onValuesChange={(changeValues, values) => {
            console.log(values);
            setValue(values);
          }}
        >
          <Form.Item label="规则树" name="rule" initialValue={value} required>
            <RuleTree
              actionRef={ruleTreeRef}
              fields={[
                {
                  name: 'name',
                  rules: [
                    {
                      required: true,
                    },
                  ],
                  initialValue: '',
                  render: (ctx) => {
                    const errorStyle = ctx.getFieldError().length && {
                      borderColor: 'red',
                    };
                    return <Input style={{ height: 32, ...errorStyle }} />;
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
                  render: (ctx) => {
                    const name = ctx.getFieldValue('name');
                    const check = ctx.getFieldValue('check');
                    if (name === '1024') {
                      return <div>ho!!</div>;
                    }
                    return check ? (
                      <Select>
                        <Select.Option value="0">男</Select.Option>
                        <Select.Option value="1">女</Select.Option>
                      </Select>
                    ) : (
                      false
                    );
                  },
                },
              ]}
              relationRender={({ isRoot }) => {
                return (
                  <Select bordered={isRoot} style={{ width: 80 }}>
                    <Select.Option value="and">and</Select.Option>
                    <Select.Option value="or">or</Select.Option>
                  </Select>
                );
              }}
              cascades={['name']}
              onCascade={(ctx) => {
                console.log('onCascade');
                ctx.setFieldValue('sex', '1');
              }}
            />
          </Form.Item>
          <Space>
            <Button onClick={handleClick}>修改值</Button>
            <Button htmlType="submit">提交</Button>
          </Space>
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
