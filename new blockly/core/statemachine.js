

'use strict';

Blockly.Blocks['machine'] = {
    init: function() {
      Blockly.Extensions.apply("inline-svgs", this, !1),
      this.appendDummyInput("first").appendField("狀態").appendField("=").appendField(new Blockly.FieldTextInput("exit"), "exitname").appendField("時 結束");

      this.appendDummyInput()
        .appendField("當")
        .appendField(new Blockly.FieldVariable("state"), "state0")
        .appendField("=")
        .appendField(new Blockly.FieldTextInput("cond0"), "cond0");

      // this.appendDummyInput("state0").appendField("if").appendField( "state").appendField("=").appendField(new Blockly.FieldVariable("cond1"), "state0"),

      this.appendStatementInput("do0").setCheck(null).appendField("do"),
      this.appendDummyInput("ADD0").appendField( "下一個狀態").appendField("=").appendField(new Blockly.FieldTextInput("exit"), "ADD0"),
      this.setInputsInline(false);
      this.setColour(230);
      this.itemCount_ = 1;
      this.setTooltip("");
      this.setHelpUrl("");
    },
    
    mutationToDom: function() {
      var t = Blockly.utils.xml.createElement("mutation");
      return t.setAttribute("item", this.itemCount_),
      t
    },
    domToMutation: function(t) {
        this.itemCount_ = parseInt(t.getAttribute("item"), 10),
        this.updateShape_() ;
    },
    storeConnections_: function() {
        this.valueConnections_ = [];
        this.statementConnections_ = [],
        this.elseStatementConnection_ = [];
        for (var t = 1; t < this.getInput("ADD" + t); t++)
            (this.valueConnections_.push(this.getInput("ADD" + t).connection.targetConnection),
            this.statementConnections_.push(this.getInput("do" + t).connection.targetConnection),
            this.elseStatementConnection_.push(this.getInput("state" + t).connection.targetConnection ) ) ;
    },
    restoreConnections_: function() {
        for (var t = 0; t < this.itemCount_; t++)
            (Blockly.Mutator.reconnect(this.elseStatementConnection_[t], this, "state" + t),
            Blockly.Mutator.reconnect(this.statementConnections_[t], this, "do" + t),
            Blockly.Mutator.reconnect(this.valueConnections_[t], this, "ADD" + t) )
    },
 
    addItem_: function() {
        this.storeConnections_()
        this.update_(function() {
            this.itemCount_++
        })
        this.restoreConnections_()
  
    },
    removeItem_: function() {
        this.storeConnections_(),
        this.update_(function() {
            this.itemCount_--
        }),
        this.restoreConnections_()
    },

    update_: function(t) {
        Blockly.Events.setGroup(!0);
        var e = this
            , o = e.mutationToDom();
        o = o && Blockly.Xml.domToText(o);
        var i = e.rendered;
        e.rendered = !1,
        t && t.call(this),
        this.updateShape_(),
        e.rendered = i,
        e.initSvg();
        var n = Blockly.Events.getGroup();
        o != (t = (t = e.mutationToDom()) && Blockly.Xml.domToText(t)) && (Blockly.Events.fire(new Blockly.Events.BlockChange(e,"mutation",null,o,t)),
        setTimeout(function() {
            Blockly.Events.setGroup(n),
            e.bumpNeighbours(),
            Blockly.Events.setGroup(!1)
        }, Blockly.BUMP_DELAY)),
        e.rendered && e.render(),
        Blockly.Events.setGroup(!1)
    },
    updateShape_: function() {
        var t = this
            , e = function() {
            t.removeItem_()
        };
        var o = 1;
        for ( ; this.getInput("ADD" + o); )
            this.removeInput("ADD" + o),
            this.removeInput("state" + o),
            this.removeInput("do" + o),
            o ++ ;
    
        for (o = 1; o < this.itemCount_; o++) {
            this.appendDummyInput("state" + o )
                .appendField("當")
                .appendField("狀態")
                .appendField("=")
                .appendField(new Blockly.FieldTextInput("cond" + o), "cond" + o );
              
            this.appendStatementInput("do" + o )
                .setCheck(null)
                .appendField("do");
            this.appendDummyInput("ADD" + o)
                .appendField("下一個狀態")
                .appendField("=")
                .appendField(new Blockly.FieldTextInput("exit"), "ADD" + o ) ; 
        }
        this.getInput("BUTTONS") && this.removeInput("BUTTONS"),
        o = this.appendDummyInput('BUTTONS'),

        1 < this.itemCount_ && o.appendField(new Blockly.FieldImage(this.REMOVE_IMAGE_DATAURI,16,16,"*",e ,!1,"blocklyPointermage")),
        o.appendField(new Blockly.FieldImage(this.ADD_IMAGE_DATAURI,16,16,"*",function() {
            t.addItem_()
        }
        ,!1,"blocklyPointermage")).setAlign(Blockly.ALIGN_RIGHT),
        //e = this.itemCount_ <= 5,
        this.setInputsInline(false ) 
        // this.setOutputShape(e ? Blockly.OUTPUT_SHAPE_ROUND : Blockly.OUTPUT_SHAPE_SQUARE)
    }

  };
