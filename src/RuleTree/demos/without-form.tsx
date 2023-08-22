import { Input, Select } from 'antd';
import RuleTree from 'react-rule-tree';

export default () => {
  return (
    <div style={{ padding: '20px 50px', backgroundColor: 'white' }}>
      <RuleTree
        defaultValue={{
          relation: 'and',
        }}
        onChange={(value) => {
          console.log(value);
        }}
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
        relationRender={({ isRoot }) => (
          <Select bordered={isRoot}>
            <Select.Option value="and">and</Select.Option>
            <Select.Option value="or">or</Select.Option>
          </Select>
        )}
      />
    </div>
  );
};
