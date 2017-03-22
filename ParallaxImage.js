/**
 * @providesModule ParallaxImage
 */
'use strict';

var isEqual = require('lodash/lang/isEqual');
var React = require('react');
var {
  View,
  Image,
  Animated,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} = require('react-native');

var WINDOW_HEIGHT = Dimensions.get('window').height;

var ParallaxImage = React.createClass({
  propTypes: {
    onPress:        React.PropTypes.func,
    overlayContent: React.PropTypes.func,
    scrollY:        React.PropTypes.object,
    parallaxFactor: React.PropTypes.number,
    imageStyle:     Image.propTypes.style,
    overlayStyle:   View.propTypes.style,
  },

  getDefaultProps: function() {
    return {
      parallaxFactor: 0.2,
    };
  },

  getInitialState: function() {
    this.isLayoutStale = true;
    return {
      offsetMeassured: false,
      offset: 0,
      height: 0,
      width:  0,
    };
  },

  setNativeProps: function(nativeProps) {
    this._container.setNativeProps(nativeProps);
  },

  // Measure again since onLayout event won't pass the offset
  handleLayout: function(event) {
    if(this.isLayoutStale) {
      (this._touchable || this._container).measure(this.handleMeasure);
    }
  },

  componentWillReceiveProps: function(nextProps) {
    if(!isEqual(nextProps, this.props)) {
      this.isLayoutStale = true;
    }
  },

  handleMeasure: function(ox, oy, width, height, px, py) {
    // console.warn('ox:'+ox, 'oy:'+oy, 'width:'+width, 'height:'+height, 'px:'+px, 'py:'+py);
    this.isLayoutStale = false;
    if (!this.state.offsetMeassured) {
      this.setState({
        offsetMeassured: true,
        offset: py,
        height,
        width,
      });
    }
  },

  render: function() {
    var { offset, width, height } = this.state;
    var {
      onPress,
      overlayContent,
      scrollY,
      parallaxFactor,
      style,
      imageStyle,
      overlayStyle,
      children,
      ...props
    } = this.props;
    var parallaxPadding = height * parallaxFactor;

    var parallaxStyle = {
      // height: height - parallaxPadding * 1.2,
      height: 470,
      width: width,
    };
    if(scrollY) {
      parallaxStyle.transform = [
        {
          translateY:   scrollY.interpolate({
            inputRange:   [offset - height, offset + WINDOW_HEIGHT + height],
            outputRange:  [-parallaxPadding, parallaxPadding]
          }),
          // extrapolate:  'clamp',
        },
      ];
    } else {
      parallaxStyle.transform = [
        { translateY: -parallaxPadding },
      ];
    }
    var content = (
      <TouchableOpacity
        ref={component => this._container = component}
        activeOpacity={0.6}
        style={[style, styles.container]}
        onLayout={this.handleLayout}
        onPress={onPress}
      >
        <Animated.Image
          {...props}
          style={imageStyle, parallaxStyle}
          pointerEvents="none"
        />
        <View style={[styles.overlay, overlayStyle]}>
          {overlayContent && overlayContent()}
        </View>
      </TouchableOpacity>
    );
    // Dummy touchable to make it work on Android
    return (
      <TouchableOpacity ref={component => this._touchable = component} activeOpacity={1}>
        {content}
        {children}
      </TouchableOpacity>
    );
  }
});

var styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
  overlay: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

module.exports = ParallaxImage;
