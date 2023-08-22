import ProField from '@ant-design/pro-field';
import { Input, Select } from 'antd';
import React, { useRef, useState } from 'react';
import type { ActionType } from 'react-rule-tree';
import RuleTree from 'react-rule-tree';
import './common.less';

export default () => {
  const actionRef = useRef<ActionType>();
  const [value, setValue] = useState<Record<string, any>>({
    relation: 'and',
    collapse: false,
    children: [
      {
        name: '1',
      },
      {
        relation: 'or',
        children: [
          {
            relation: 'and',
            name: '1',
          },
          {
            relation: 'and',
            collapse: false,
            children: [
              {
                name: '1',
              },
            ],
          },
          {
            relation: 'and',
            collapse: false,
            children: [
              {
                name: '1',
              },
            ],
          },
        ],
      },
    ],
  });
  return (
    <>
      <div style={{ padding: '20px 50px', backgroundColor: 'white' }}>
        <RuleTree
          onChange={(currentValue) => {
            setValue(currentValue);
          }}
          actionRef={actionRef}
          fields={[
            {
              name: 'name',
              rules: [
                {
                  required: true,
                },
              ],
              initialValue: '1',
              render: () => {
                return <Input />;
              },
            },
          ]}
          defaultValue={value}
          modifyTreeNode={() => {
            return {
              removable: true,
            };
          }}
          relationRender={({ isRoot }) => (
            <Select bordered={isRoot} style={{ width: 72 }}>
              <Select.Option value="and">AND</Select.Option>
              <Select.Option value="or">OR</Select.Option>
            </Select>
          )}
        />
      </div>
      <button onClick={() => actionRef.current.reRender()}>re render</button>
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
    </>
  );
};
