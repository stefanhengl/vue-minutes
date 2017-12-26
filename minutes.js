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

// Vue instance, data bus
app = new Vue({
    el: '#app',
    data: {
        texts: [],
        lastKnowDate: "",
    },
    created() {
        this.$on('submitContent', function (msg) {
            let now = new Date();
            let stamp = dateFormat(now, "dddd, mmmm dS, h TT");

            // For each new hour, push an additional date header to the array
            if (this.lastKnowDate !== stamp) {
                this.texts = immutablePush(this.texts, {message: "", time: "", stamp: stamp, type: "header"})
                this.lastKnowDate = stamp
            }

            // push new item
            this.texts = immutablePush(this.texts, {message: msg, time: dateFormat(now, "hh:MM"), stamp: stamp, type: "bubble"})
        });
        this.$on('deleteItem', function(index) {
            Vue.delete(this.texts, index)
        });
        this.$on('deleteAll', function(stamp) {
            for (var i = this.texts.length-1; i >=0; i--) {
                if (this.texts[i].stamp === stamp) {
                    Vue.delete(this.texts, i)
                }
            }
            // reset lastKnownDate if the stamp to be deleted is the last one. This way
            // we make sure that a new stamp is added when new items are submitted.
            if (this.lastKnowDate === stamp) {
                this.lastKnowDate = ""
            }
        });
    },

})
