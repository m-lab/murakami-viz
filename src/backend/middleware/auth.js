import Roles from 'koa-roles';
/**
 * Installs authorization middleware into the koa app.
 *
 * @param {Object} ctx - the koa context object
 * @param {funtion} next - continue to next middleware
 */

const authWrapper = groups => {
  const roles = new Roles();

  roles.use('access private pages', ctx => ctx.isAuthenticated());

  roles.use('access admin pages', ctx => {
    if (!ctx.isAuthenticated()) return false;

    return groups.isMemberOf('admins', ctx.state.user.id);
  });

  return roles;
};

export default authWrapper;
