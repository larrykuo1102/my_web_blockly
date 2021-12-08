

'use strict';

//oog.provide('Blockly.JavaScript.else_block');

//goog.require('Blockly.JavaScript');

Blockly.Blocks['else_block'] = {
    init: function() {
      this.appendValueInput("NAME")
          .setCheck("Number")
          .appendField("number");
      this.appendStatementInput("else")
          .setCheck("Boolean");
      this.setInputsInline(false);
      this.setNextStatement(true, null);
      this.setColour(345);
   this.setTooltip("");
   this.setHelpUrl("");
    }
  };



  