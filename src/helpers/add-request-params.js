'use strict';

/**
 * @param {Array} handlers
 * @param {string} pathname
 *
 * @return {Object}
 */
function addReqeustParams( handlers, pathname ) {
  var params = {};
  var pathname_params;
  var path_split;

  handlers.forEach(
    /**
     * @param {Object} handler
     * @returns {undefined}
     */
    function ( handler ) {
      path_split = handler.path.split( ':' );
      pathname_params = pathname.replace( path_split[ 0 ], '' ).split( '/' );

      path_split.slice( 1 )
        .forEach(
          /**
           * @param {string} param
           * @param {number} index
           *
           * @returns {undefined}
           */
          function ( param, index ) {
            params[ param ] = decodeURIComponent( pathname_params[ index ] );
          }
        );
    }
  );

  return params;
}

module.exports = addReqeustParams;
