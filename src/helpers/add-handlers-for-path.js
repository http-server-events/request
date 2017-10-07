'use strict';

/**
 * @param {Object} Server
 *
 * @param {Object} Server.request_handlers
 * '.'  path is used for prefix handlers
 * '..' path is used for suffix handlers
 *
 * @param {string} method
 * @param {string} pathname
 *
 * @return {Array}
 */
function addHandlersForPath( Server, method, pathname ) {
  var handlers = [];
  var pathname_separator_count = pathname.split( '/' ).length;

  /**
   * add prefix handlers
   * they handle all paths
   */
  if ( Array.isArray( Server.request_handlers[ method ][ '.' ] ) ) {
    handlers = handlers.concat( Server.request_handlers[ method ][ '.' ] );
  }

  /**
   * add path specific handlers
   * they handle a specific method
   * they handle a specific path
   *
   * @example /products/
   */
  if ( Array.isArray( Server.request_handlers[ method ][ pathname ] ) ) {
    handlers = handlers.concat( Server.request_handlers[ method ][ pathname ] );
  }

  /**
   * add path specific handlers with params
   * they handle a specific method
   * they handle a specific path with params
   *
   * @example /products/:id
   * @example /products/:group/:id
   */
  Object.keys( Server.request_handlers[ method ] ).forEach(
    /**
     * @param {string} handler_path
     *
     * @returns {undefined}
     */
    function ( handler_path ) {
      var handler_path_separator_count;

      /**
       * @type {Array}
       *
       * @property [ 0 ] url path
       * @property [ n ] url params
       */
      var handler_path_split = handler_path.split( ':' );

      if ( handler_path_split.length > 1 ) {
        if ( pathname.indexOf( handler_path_split[ 0 ] ) !== -1 ) {
          handler_path_separator_count = handler_path.split( '/' ).length;

          if ( pathname_separator_count === handler_path_separator_count ) {
            handlers = handlers.concat( Server.request_handlers[ method ][ handler_path ] );
          }
        }
      }
    }
  );

  /**
   * add suffix handlers
   * they handle a specific method
   * they handle all paths
   */
  if ( Array.isArray( Server.request_handlers[ method ][ '..' ] ) ) {
    handlers = handlers.concat( Server.request_handlers[ method ][ '..' ] );
  }

  return handlers;
}

module.exports = addHandlersForPath;
