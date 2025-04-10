/**
 * Babel configuration for Flip Card Project
 * Supports modern JavaScript features for testing and development
 */
module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: {
        node: 'current',
        browsers: [
          'last 2 versions',
          'not dead',
          'not IE 11'
        ]
      },
      useBuiltIns: 'usage',
      corejs: 3
    }]
  ]
};