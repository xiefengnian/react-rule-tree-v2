import createEmotion from '@emotion/css/create-instance';
// 正常情况使用下方的自定义
export const {
  flush,
  hydrate,
  cx,
  merge,
  getRegisteredStyles,
  injectGlobal,
  keyframes,
  css,
  sheet,
  cache,
} = createEmotion({
  // The key option is required when there will be multiple instances in a single app
  key: 'tech-ui-rule-tree',
  container: document.body || undefined,
});
export const cssEmotion = (componentName: string) =>
  createEmotion({
    key: componentName,
    container: document.body || undefined,
  });
