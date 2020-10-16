import Roles from 'koa-roles';
import { getLogger } from '../log.js';

const log = getLogger('backend:middleware:auth');
/**
 * Installs authorization middleware into the koa app.
 *
 * @param {Object} ctx - the koa context object
 * @param {funtion} next - continue to next middleware
 */

// fixIP and fixLocalhost adapted from koa-ip-geo Copyright (c) 2018 Sebastian
// Hildebrandt under the MIT License
// https://github.com/sebhildebrandt/koa-ip-geo

// fix for IPv6 Dotted-quad notation
function fixIp(ip) {
  if (ip.indexOf(':') !== -1 && ip.indexOf('.') !== -1) {
    ip = ip.split(':');
    ip = ip[ip.length - 1];
  }
  return ip;
}

function fixLocalhost(list) {
  if (
    list.indexOf('127.0.0.1') !== -1 ||
    list.indexOf(':.1') !== -1 ||
    list.indexOf('localhost') !== -1
  ) {
    if (list.indexOf('127.0.0.1') === -1) list.push('127.0.0.1');
    if (list.indexOf('::1') === -1) list.push('::1');
    if (list.indexOf('localhost') === -1) list.push('localhost');
  }
  return list;
}

const authWrapper = (groups, libraries, isTest) => {
  const roles = new Roles();

  roles.isMemberOf = (group, id) => {
    return groups.isMemberOf(group, id);
  };

  roles.use('access private pages', ctx => ctx.isAuthenticated());

  roles.use('access admin pages', ctx => {
    log.debug('Checking if user can access admin pages.');
    if (!ctx.isAuthenticated()) return false;

    return groups.isMemberOf('admins', ctx.state.user.id);
  });

  roles.use('edit this library', async ctx => {
    log.debug('Checking if user can edit this library.');
    if (!ctx.isAuthenticated()) return false;

    const isAdmin = await groups.isMemberOf('admins', ctx.state.user.id);
    if (isAdmin) return true;

    if (ctx.state.library) {
      const libraryMember = await libraries.isMemberOf(
        ctx.state.library,
        ctx.state.user.id,
      );
      const isEditor = await groups.isMemberOf('editors', ctx.state.user.id);
      return libraryMember && isEditor;
    } else {
      return false;
    }
  });

  roles.use('view this library', async ctx => {
    log.debug('Checking if user can view this library.');
    if (!ctx.isAuthenticated()) return false;

    const isAdmin = await groups.isMemberOf('admins', ctx.state.user.id);
    if (isAdmin) return true;

    if (ctx.state.library) {
      const libraryMember = await libraries.isMemberOf(
        ctx.state.library,
        ctx.state.user.id,
      );
      return libraryMember;
    } else {
      return false;
    }
  });

  roles.use('write from whitelisted IP', async ctx => {
    log.debug('Checking if this client IP has write access.');
    let ips = await libraries.findAllIps();
    log.debug('Permitted IPs:', ips);
    if (ips.length && ips.length > 0 && !isTest) {
      let whitelist = fixLocalhost(ips);
      let ip = ctx.ip;
      ip = fixIp(ip);
      log.debug(`Searching allowlist for IP ${ip}...`);
      return whitelist.some(entry => {
        let pattern = new RegExp(entry);
        return pattern.test(ip);
      });
    } else {
      return true;
    }
  });

  return roles;
};

export default authWrapper;
