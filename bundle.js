(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Simple vue js app with the following components and instances
//
// Components
// ----------
// bubble: a bubble hold the text the user entered
// input-field: new text is entered here
// meeting-button: the user selects a meeting by pressing on the meeting button
// meeting-adder: the user can add new meetings
//
// Instance, event-bus
// --------
// vue instance (app)
const dateFormat = require('dateformat');


function immutablePush(arr, newEntry) {
  return [...arr, newEntry];
}

// green bubbles and date headers
Vue.component('bubble', {
  template:
        `
    <div v-if="type === 'bubble'" class="bubbleContainer">
        <div class="bubbleButtonContainer">
            <div class="bubble">
                <div class="content">    
                    {{text}}
                </div>
                <div class="timeOfDay">
                    {{time}}
                </div>
            </div>
            <button class="deleteIcon" @click="deleteItem"></button>
        </div>
    </div>
    <div  v-else class="headerContainer">
        <p class="timeStamp">{{stamp}}</p>
        <button class="deleteIcon red" @click="deleteAll"></button>
    </div>
    `,
  props: ['text', 'index', 'time', 'stamp', 'type', 'flag'],
  methods: {
    deleteItem() {
      app.$emit('deleteItem', this.index);
    },
    deleteAll() {
      app.$emit('deleteAll', this.stamp);
    },
  },
});

// input field
Vue.component('input-field', {
  template:
        `
    <textarea class="inputBubble" @keydown="inputHandler" v-model="msg" placeholder="Type something! Press ⌘ + Enter to commit."></textarea>
    `,
  data() {
    return {
      msg: '',
    };
  },
  methods: {
    inputHandler(e) {
      // console.log(e.keyCode)
      if ((e.metaKey || e.ctrlKey) && e.keyCode === 13) {
        if (this.msg === '') {
          return;
        }
        app.$emit('submitContent', this.msg);
        this.msg = '';
      }
    },
  },
});

// Each meeting is represented by a button with delete option
Vue.component('meeting-button', {
  template:
        `
    <div class="meetingButtonDeleteIconContainer">
    <button class="meetingButton" @click="buttonClicked">{{meeting}}</button>
    <button class="deleteIcon" @click="deleteMeeting"></button>
    </div>
    `,
  props: ['meeting', 'index'],
  methods: {
    buttonClicked() {
      app.$emit('buttonClicked', this.meeting);
    },
    deleteMeeting() {
      app.$emit('deleteMeeting', this.meeting, this.index);
    },
  },
});

// Simple input field. The user can add a meeting by entering the title and pressing enter
Vue.component('meeting-adder', {
  template:
        `
    <div>
        <input class="meetingAdder" v-model="content" @keydown="inputHandler" placeholder="Add a new meeting ...">
    </div>
    `,
  data() {
    return {
      content: '',
    };
  },
  methods: {
    addMeeting() {
      app.$emit('addMeeting', this.content);
    },
    inputHandler(e) {
      if (e.keyCode === 13) {
        this.addMeeting();
        this.content = '';
      }
    },
  },
});

// Vue instance, event-bus
let app = new Vue({
  el: '#app',
  data: {
    texts: {},
    lastKnowDate: {},
    meetings: [],
    selected: '',
  },
  created() {
    this.$on('submitContent', (msg) => {
      if (this.selected === '') {
        alert('Add a new meeting on the left. Pick a short title or even just initials.');
        return;
      }


      const now = new Date();
      const stamp = dateFormat(now, 'dddd, mmmm dS, h TT');

      let meeting = [];
      if (this.selected in this.texts) {
        meeting = this.texts[this.selected];
      }

      // For each new hour, push an additional date header to the array
      if (this.lastKnowDate[this.selected] !== stamp) {
        meeting = immutablePush(meeting, {
          message: '', time: '', stamp, type: 'header',
        });
        this.lastKnowDate[this.selected] = stamp;
      }

      // push new item
      meeting = immutablePush(meeting, {
        message: msg, time: dateFormat(now, 'hh:MM'), stamp, type: 'bubble',
      });
      this.texts = Object.assign({}, this.texts, { [this.selected]: meeting });
    });
    this.$on('deleteItem', (index) => {
      Vue.delete(this.texts[this.selected], index);
    });
    this.$on('deleteAll', (stamp) => {
      for (let i = this.texts[this.selected].length - 1; i >= 0; i -= 1) {
        if (this.texts[this.selected][i].stamp === stamp) {
          Vue.delete(this.texts[this.selected], i);
        }
      }
      // reset lastKnownDate if the stamp to be deleted is the last one. This way
      // we make sure that a new stamp is added when new items are submitted.
      if (this.lastKnowDate[this.selected] === stamp) {
        this.lastKnowDate[this.selected] = '';
      }
    });
    this.$on('buttonClicked', (meeting) => {
      this.selected = meeting;
    });
    this.$on('addMeeting', (meeting) => {
      this.meetings = immutablePush(this.meetings, meeting);
      this.lastKnowDate[meeting] = '';
    });
    this.$on('deleteMeeting', (meeting, index) => {
      Vue.delete(this.meetings, index);
      Vue.delete(this.texts, meeting);
      if (this.selected === meeting) {
        this.selected = '';
      }
    });
  },

});

},{"dateformat":2}],2:[function(require,module,exports){
/*
 * Date Format 1.2.3
 * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
 * MIT license
 *
 * Includes enhancements by Scott Trenda <scott.trenda.net>
 * and Kris Kowal <cixar.com/~kris.kowal/>
 *
 * Accepts a date, a mask, or a date and a mask.
 * Returns a formatted version of the given date.
 * The date defaults to the current date/time.
 * The mask defaults to dateFormat.masks.default.
 */

(function(global) {
  'use strict';

  var dateFormat = (function() {
      var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZWN]|'[^']*'|'[^']*'/g;
      var timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g;
      var timezoneClip = /[^-+\dA-Z]/g;
  
      // Regexes and supporting functions are cached through closure
      return function (date, mask, utc, gmt) {
  
        // You can't provide utc if you skip other args (use the 'UTC:' mask prefix)
        if (arguments.length === 1 && kindOf(date) === 'string' && !/\d/.test(date)) {
          mask = date;
          date = undefined;
        }
  
        date = date || new Date;
  
        if(!(date instanceof Date)) {
          date = new Date(date);
        }
  
        if (isNaN(date)) {
          throw TypeError('Invalid date');
        }
  
        mask = String(dateFormat.masks[mask] || mask || dateFormat.masks['default']);
  
        // Allow setting the utc/gmt argument via the mask
        var maskSlice = mask.slice(0, 4);
        if (maskSlice === 'UTC:' || maskSlice === 'GMT:') {
          mask = mask.slice(4);
          utc = true;
          if (maskSlice === 'GMT:') {
            gmt = true;
          }
        }
  
        var _ = utc ? 'getUTC' : 'get';
        var d = date[_ + 'Date']();
        var D = date[_ + 'Day']();
        var m = date[_ + 'Month']();
        var y = date[_ + 'FullYear']();
        var H = date[_ + 'Hours']();
        var M = date[_ + 'Minutes']();
        var s = date[_ + 'Seconds']();
        var L = date[_ + 'Milliseconds']();
        var o = utc ? 0 : date.getTimezoneOffset();
        var W = getWeek(date);
        var N = getDayOfWeek(date);
        var flags = {
          d:    d,
          dd:   pad(d),
          ddd:  dateFormat.i18n.dayNames[D],
          dddd: dateFormat.i18n.dayNames[D + 7],
          m:    m + 1,
          mm:   pad(m + 1),
          mmm:  dateFormat.i18n.monthNames[m],
          mmmm: dateFormat.i18n.monthNames[m + 12],
          yy:   String(y).slice(2),
          yyyy: y,
          h:    H % 12 || 12,
          hh:   pad(H % 12 || 12),
          H:    H,
          HH:   pad(H),
          M:    M,
          MM:   pad(M),
          s:    s,
          ss:   pad(s),
          l:    pad(L, 3),
          L:    pad(Math.round(L / 10)),
          t:    H < 12 ? dateFormat.i18n.timeNames[0] : dateFormat.i18n.timeNames[1],
          tt:   H < 12 ? dateFormat.i18n.timeNames[2] : dateFormat.i18n.timeNames[3],
          T:    H < 12 ? dateFormat.i18n.timeNames[4] : dateFormat.i18n.timeNames[5],
          TT:   H < 12 ? dateFormat.i18n.timeNames[6] : dateFormat.i18n.timeNames[7],
          Z:    gmt ? 'GMT' : utc ? 'UTC' : (String(date).match(timezone) || ['']).pop().replace(timezoneClip, ''),
          o:    (o > 0 ? '-' : '+') + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
          S:    ['th', 'st', 'nd', 'rd'][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10],
          W:    W,
          N:    N
        };
  
        return mask.replace(token, function (match) {
          if (match in flags) {
            return flags[match];
          }
          return match.slice(1, match.length - 1);
        });
      };
    })();

  dateFormat.masks = {
    'default':               'ddd mmm dd yyyy HH:MM:ss',
    'shortDate':             'm/d/yy',
    'mediumDate':            'mmm d, yyyy',
    'longDate':              'mmmm d, yyyy',
    'fullDate':              'dddd, mmmm d, yyyy',
    'shortTime':             'h:MM TT',
    'mediumTime':            'h:MM:ss TT',
    'longTime':              'h:MM:ss TT Z',
    'isoDate':               'yyyy-mm-dd',
    'isoTime':               'HH:MM:ss',
    'isoDateTime':           'yyyy-mm-dd\'T\'HH:MM:sso',
    'isoUtcDateTime':        'UTC:yyyy-mm-dd\'T\'HH:MM:ss\'Z\'',
    'expiresHeaderFormat':   'ddd, dd mmm yyyy HH:MM:ss Z'
  };

  // Internationalization strings
  dateFormat.i18n = {
    dayNames: [
      'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat',
      'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
    ],
    monthNames: [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
      'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
    ],
    timeNames: [
      'a', 'p', 'am', 'pm', 'A', 'P', 'AM', 'PM'
    ]
  };

function pad(val, len) {
  val = String(val);
  len = len || 2;
  while (val.length < len) {
    val = '0' + val;
  }
  return val;
}

/**
 * Get the ISO 8601 week number
 * Based on comments from
 * http://techblog.procurios.nl/k/n618/news/view/33796/14863/Calculate-ISO-8601-week-and-year-in-javascript.html
 *
 * @param  {Object} `date`
 * @return {Number}
 */
function getWeek(date) {
  // Remove time components of date
  var targetThursday = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  // Change date to Thursday same week
  targetThursday.setDate(targetThursday.getDate() - ((targetThursday.getDay() + 6) % 7) + 3);

  // Take January 4th as it is always in week 1 (see ISO 8601)
  var firstThursday = new Date(targetThursday.getFullYear(), 0, 4);

  // Change date to Thursday same week
  firstThursday.setDate(firstThursday.getDate() - ((firstThursday.getDay() + 6) % 7) + 3);

  // Check if daylight-saving-time-switch occurred and correct for it
  var ds = targetThursday.getTimezoneOffset() - firstThursday.getTimezoneOffset();
  targetThursday.setHours(targetThursday.getHours() - ds);

  // Number of weeks between target Thursday and first Thursday
  var weekDiff = (targetThursday - firstThursday) / (86400000*7);
  return 1 + Math.floor(weekDiff);
}

/**
 * Get ISO-8601 numeric representation of the day of the week
 * 1 (for Monday) through 7 (for Sunday)
 * 
 * @param  {Object} `date`
 * @return {Number}
 */
function getDayOfWeek(date) {
  var dow = date.getDay();
  if(dow === 0) {
    dow = 7;
  }
  return dow;
}

/**
 * kind-of shortcut
 * @param  {*} val
 * @return {String}
 */
function kindOf(val) {
  if (val === null) {
    return 'null';
  }

  if (val === undefined) {
    return 'undefined';
  }

  if (typeof val !== 'object') {
    return typeof val;
  }

  if (Array.isArray(val)) {
    return 'array';
  }

  return {}.toString.call(val)
    .slice(8, -1).toLowerCase();
};



  if (typeof define === 'function' && define.amd) {
    define(function () {
      return dateFormat;
    });
  } else if (typeof exports === 'object') {
    module.exports = dateFormat;
  } else {
    global.dateFormat = dateFormat;
  }
})(this);

},{}]},{},[1]);
