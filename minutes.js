require('vue');
var dateFormat = require('dateformat');

function immutablePush(arr, newEntry) {
    return [...arr, newEntry]
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
            app.$emit('deleteItem', this.index)
        },
        deleteAll() {
            app.$emit('deleteAll', this.stamp)
        },
    }
})

// input field
Vue.component('input-field', {
    template:
    `
    <textarea class="inputBubble" @keydown="inputHandler" v-model="msg" placeholder="Type something! Press ⌘ + Enter to commit."></textarea>
    `,
    data: function () {
        return {
            msg: ""
        }
    },
    methods: {
        inputHandler(e) {
            // console.log(e.keyCode)
            if ((e.metaKey || e.ctrlKey) && e.keyCode == 13) {
                if (this.msg === "") {
                    return
                }
                app.$emit('submitContent', this.msg)
                this.msg = ""
            }
        }
    },
})

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
            app.$emit('buttonClicked', this.meeting)
        },
        deleteMeeting() {
            app.$emit('deleteMeeting', this.meeting, this.index)
        }
    }
})

Vue.component('meeting-adder', {
    template:
    `
    <div>
        <input class="meetingAdder" v-model="content" @keydown="inputHandler" placeholder="Add a new meeting ...">
    </div>
    `,
    data: function () {
        return {
            content : ""
        }
    },
    methods: {
        addMeeting() {
            app.$emit('addMeeting', this.content)
        },
        inputHandler(e) {
            console.log(e.keyCode)
            if (e.keyCode == 13) {
               this.addMeeting()
               this.content=""
            }
        }
    }
})

// Vue instance, data bus
app = new Vue({
    el: '#app',
    data: {
        texts: {},
        lastKnowDate: {},
        meetings: [],
        selected: '',
    },
    created() {
        this.$on('submitContent', function (msg) {
            if (this.selected === '') {
                alert('Add a new meeting on the left. Pick a short title or even just initials.')
                return
            }


            let now = new Date();
            let stamp = dateFormat(now, "dddd, mmmm dS, h TT");

            let meeting = []
            if (this.selected in this.texts) {
                meeting = this.texts[this.selected]
            }
        
            // For each new hour, push an additional date header to the array
            if (this.lastKnowDate[this.selected] !== stamp) {
                meeting = immutablePush(meeting, {message: "", time: "", stamp: stamp, type: "header"})
                this.lastKnowDate[this.selected] = stamp
            }

            // push new item
            meeting = immutablePush(meeting, {message: msg, time: dateFormat(now, "hh:MM"), stamp: stamp, type: "bubble"})
            this.texts = Object.assign({}, this.texts, {[this.selected]: meeting})
        });
        this.$on('deleteItem', function(index) {
            Vue.delete(this.texts[this.selected], index)
        });
        this.$on('deleteAll', function(stamp) {
            for (var i = this.texts[this.selected].length-1; i >=0; i--) {
                if (this.texts[this.selected][i].stamp === stamp) {
                    Vue.delete(this.texts[this.selected], i)
                }
            }
            // reset lastKnownDate if the stamp to be deleted is the last one. This way
            // we make sure that a new stamp is added when new items are submitted.
            if (this.lastKnowDate === stamp) {
                this.lastKnowDate = ""
            }
        });
        this.$on('buttonClicked', function(meeting) {
            this.selected = meeting
        });
        this.$on('addMeeting', function(meeting) {
            this.meetings = immutablePush(this.meetings, meeting)
            this.lastKnowDate[meeting] = ""
        });
        this.$on('deleteMeeting', function(meeting, index) {
            Vue.delete(this.meetings, index)
            Vue.delete(this.texts, meeting)
            if (this.selected === meeting) {
                this.selected = ""
            }
        });
    },

})
