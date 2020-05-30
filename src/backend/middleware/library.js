/**
 * Middleware shim to get current library and add it to context.
 *
 * @param {Object} ctx - the koa context object
 * @param {funtion} next - continue to next middleware
 */

const currentLibrary = () => {
  return async (ctx, next) => {
    const path = ctx.request.path.replace(/^\/+|\/+$/g, '').split('/');
    if (path[0] === 'api' && path[2] === 'libraries') {
      ctx.state.library = path[3];
    } else {
      ctx.state.library = null;
    }
    await next();
  };
};

export default currentLibrary;
