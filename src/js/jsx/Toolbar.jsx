/*
 * Copyright (c) 2014 Adobe Systems Incorporated. All rights reserved.
 *  
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"), 
 * to deal in the Software without restriction, including without limitation 
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, 
 * and/or sell copies of the Software, and to permit persons to whom the 
 * Software is furnished to do so, subject to the following conditions:
 *  
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *  
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
 * DEALINGS IN THE SOFTWARE.
 * 
 */

define(function (require, exports, module) {
    "use strict";

    var React = require("react");

    var Fluxxor = require("fluxxor"),
        FluxMixin = Fluxxor.FluxMixin(React),
        StoreWatchMixin = Fluxxor.StoreWatchMixin;

    var Tool = require("jsx!js/jsx/shared/Tool");

    var Toolbar = React.createClass({
        mixins: [FluxMixin, StoreWatchMixin("tool", "application")],

        /**
         * Ordered list of toolIDs that make up the toolbar layout
         * 
         * @private
         * @type {Array.<string>}
         */
        _layout: [
            "newSelect",
            "rectangle",
            "ellipse",
            "pen",
            "typeCreateOrEdit",
            "eyedropper"
        ],

        getInitialState: function () {
            return {
                expanded: false
            };
        },
        
        getStateFromFlux: function () {
            // Maybe later on contextStore will send us list of context specific tools
            var flux = this.getFlux(),
                toolState = flux.store("tool").getState(),
                document = flux.store("application").getCurrentDocument();

            return {
                currentTool: toolState.current,
                previousTool: toolState.previous,
                document: document
            };
        },

        componentWillUpdate: function (nextProps, nextState) {
            var currentDocument = this.state.document,
                nextDocument = nextState.document,
                currentDocumentUnsupported = currentDocument && currentDocument.unsupported,
                nextDocumentUnupported = nextDocument && nextDocument.unsupported;

            // reset to the default tool only when changing from a supported to an
            // unsupported document
            if (currentDocument && !currentDocumentUnsupported && nextDocumentUnupported) {
                var flux = this.getFlux(),
                    defaultTool = flux.store("tool").getDefaultTool();

                flux.actions.tools.select(defaultTool);
            }
        },

        render: function () {
            var document = this.state.document,
                disabled = document && document.unsupported;

            // force the toolbar to collapse when the document is unsupported
            if (!disabled && this.state.expanded) {                
                return this._renderExpanded(true);                
            }
            
            return this._renderExpanded(false);
        },

        
        /**
         * Render the expanded toolbar
         * 
         * @private
         * @return {ReactComponent}
         */
        _renderExpanded: function (expanded) {

            var toolStore = this.getFlux().store("tool"),
                selectedTool = toolStore.getCurrentTool(),
                selectedToolID = selectedTool ? selectedTool.id : "",
                tools = this._layout.map(function (toolID, index) {

                    var tool = toolStore.getToolByID(toolID);
                        
                    return (
                        <Tool 
                            key={index} 
                            id={toolID}
                            selected={toolID === selectedToolID}
                            onClick={this._handleToolbarButtonClick.bind(this, tool)}
                            toolID = {toolID}
                            tool = {tool} />
                    );

                }, this);
            
            
            var toolbarClassName = React.addons.classSet({
                                "expanded": expanded,
                        "toolbar-pop-over": true
                });
            
            return (
                <div className={toolbarClassName} onBlur={this._collapseToolbar}>
                    <ul>
                        {tools}
                    </ul>
                </div>
            );
        },

        /**
         * Expand the toolbar
         * 
         * @private
         */
        _expandToolbar: function () {
            this.setState({expanded: true});
        },

        /**
         * Collapse the toolbar
         *
         * @private
         */
        _collapseToolbar: function () {
            this.setState({expanded: false});
        },

        /**
         * Handle toolbar button clicks by selecting the given tool and
         * collapsing the toolbar.
         * 
         * @private
         */
        _handleToolbarButtonClick: function (tool) {
            if (this.state.expanded) {
                
                if (tool) {
                    this.getFlux().actions.tools.select(tool);
                    // this.getDOMNode().querySelector(".tool-selected").classList.remove("tool-selected");
                    // this.getDOMNode().querySelector("#" + tool.id).classList.add("tool-selected");
                }

                this._collapseToolbar();
                
            }else{
                this._expandToolbar();
            }
            
        }
    });
    
    module.exports = Toolbar;
});


