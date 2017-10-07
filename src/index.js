/* eslint consistent-this: off */
/* eslint consistent-return: off */
/* eslint no-invalid-this: off */
/* eslint no-use-before-define: off */

'use strict';

/**
 * module dependencies
 */
var url = require( 'url' );
var addHandlersForMethodPath = require( './helpers/add-handlers-for-path' );
var addRequestParams = require( './helpers/add-request-params' );

/**
 * Class: http.Server
 * Event: 'request'
 *
 * Emitted each time there is a request. Note that there may be multiple requests per connection
 * (in the case of HTTP Keep-Alive connections).
 *
 * adds methods for handling user provided request handlers via Server.request_handlers
 * adds url path params to the IncomingMessage based on Server.request_handlers’ path
 *
 * @link https://nodejs.org/dist/latest-v6.x/docs/api/http.html#http_event_request
 * @link https://nodejs.org/dist/latest-v6.x/docs/api/http.html#http_class_http_incomingmessage
 * @link https://nodejs.org/dist/latest-v6.x/docs/api/http.html#http_class_http_serverresponse
 *
 * @param {http.IncomingMessage} req
 * @param {string} req.method
 * @param {string} req.url
 *
 * @param {http.ServerResponse} res
 * @param {Function} res.end
 * @param {boolean} res.finished
 * @param {Function} res.getHeader
 * @param {Function} res.setHeader
 * @param {Function} res.write
 * @param {Function} res.writeHead
 *
 * @returns {undefined}
 */
function requestEvent( req, res ) {
  var handler_index = -1;
  var handlers;
  var pathname = url.parse( req.url ).pathname;

  /**
   * @type {Object} Server
   * @property {boolean} debug
   */
  var Server = this;

  if ( Server.debug ) {
    console.log( '[debug]', new Date(), 'requestEvent()' );
    console.log( '' );
    console.log( req.method + ' ' + pathname );
  }

  /**
   * @type {Array}
   */
  handlers = addHandlersForMethodPath( Server, req.method, pathname );

  req.params = addRequestParams( handlers, pathname );

  if ( Server.debug ) {
    console.log( 'req.params', req.params );
    console.log( 'handlers' );
    console.log( handlers );
    console.log( '' );
  }

  /**
   * @param {Error} [err]
   * @returns {undefined}
   */
  function next( err ) {
    if ( Server.debug ) {
      console.log( '[debug]', new Date(), 'next()' );
    }

    if ( err instanceof Error ) {
      console.error( err );
      res.statusCode = err.statusCode || 500;

      if ( res.getHeader( 'content-type' ).indexOf( 'application/json' ) !== -1 ) {
        res.end( JSON.stringify( { error: err.toString() } ) );
      } else {
        res.end( err.toString() );
      }

      return;
    }

    nextHandler();
  }

  /**
   * @returns {undefined}
   */
  function nextHandler() {
    handler_index += 1;

    if ( Server.debug ) {
      console.log( '[debug]', new Date(), 'nexthandler()' );
    }

    if ( !handlers[ handler_index ] ) {
      if ( !res.finished ) {
        res.end();
      }

      return;
    }

    if ( handlers[ handler_index ].method === req.method ) {
      handlers[ handler_index ].handler.call( Server, req, res, next );
    } else {
      nextHandler();
    }
  }

  nextHandler();
}

module.exports = requestEvent;
