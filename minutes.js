require('vue');
var dateFormat = require('dateformat');

function immutablePush(arr, newEntry) {
    return [...arr, newEntry]
}

Vue.component('bubble', {
    template:
    `
    <div v-if="type === 'bubble'" class="bubbleContainer">
        <div class="bubbleButtonContainer">
            <div class="bubble">
                <div class="content" contenteditable=true @keydown="inputhandler">    
                    {{text}}
                </div>
                <div class="timeOfDay">
                    {{time}}
                </div>
            </div>
            <button class="deleteIcon" @click="deleteItem"></button>
        </div>
    </div>

    <div v-else class="bubbleContainer">
        <p v-if="show" class="timeStamp">{{stamp}}</p>
    </div>
    `,
    props: ['text', 'index', 'time', 'stamp', 'show', 'type'],
    methods: {
        deleteItem() {
            app.$emit('deleteItem', this.index)
        },
        inputhandler(e) {
            console.log(e)
        },
        moveUp() {
            app.$emit('moveUp', this.text, this.index, this.time, this.stamp, this.show)
        },
        moveDown() {
            app.$emit('moveDown', this.text, this.index, this.time, this.stamp, this.show)
        }
    }

})

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
            console.log(e.keyCode)
            if ((e.metaKey || e.ctrlKey) && e.keyCode == 13) {
                if (this.msg === "") {
                    return
                }
                app.$emit('submitContent', this.msg, -1)
                this.msg = ""
            }
        }
    },
})


app = new Vue({
    el: '#app',
    data: {
        texts: [],
        lastKnowDate: "",
    },
    created() {
        this.$on('submitContent', function (msg, id) {
            console.log('Event from parent component emitted', msg, id)
            let now = new Date();
            let stamp = dateFormat(now, "dddd, mmmm dS, h TT");
            let show = false
            if (this.lastKnowDate !== stamp) {
                this.texts = immutablePush(this.texts, {message: msg, time: dateFormat(now, "hh:MM"), stamp: stamp, show: true, tpye: "header"})
                this.lastKnowDate = stamp
            }

            this.texts = immutablePush(this.texts, {message: msg, time: dateFormat(now, "hh:MM"), stamp: stamp, show: false, type: "bubble"})
            console.log('this.texts', this.texts)
        });
        this.$on('deleteItem', function(index) {
            console.log('delete item with index', index)
            Vue.delete(this.texts, index)
        });
        this.$on('moveUp', function( text, index, time, stamp, show) {
            console.log('moving', index)
            this.texts.splice(index, 1);
            this.texts.splice(index-1, 0, {message:text, time: time, stamp:stamp, show:show, index: index-1});
        });
        this.$on('moveDown', function( text, index, time, stamp, show) {
            console.log('moving', index)
            this.texts.splice(index, 1);
            this.texts.splice(index+1, 0, {message:text, time: time, stamp:stamp, show:show, index: index+1});
        })
    },

})
