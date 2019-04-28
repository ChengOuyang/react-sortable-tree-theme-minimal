import React, { Component } from 'react';
import SortableTree, { toggleExpandedForAll } from 'react-sortable-tree';
import CustomTheme from '../index';
import './app.css';

class App extends Component {
  constructor(props) {
    super(props);

    this.handleKeyDown = this.handleKeyDown.bind(this)
    this.updateTreeData = this.updateTreeData.bind(this);
    this.selectNode = this.selectNode.bind(this)
    this.expandAll = this.expandAll.bind(this);
    this.collapseAll = this.collapseAll.bind(this);

    this.state = {
      searchString: '',
      searchFocusIndex: 0,
      searchFoundCount: null,
      treeData: [
        { title: 'This is the Full Node Drag theme', dragDisabled: true, canDrag: false, canDrop: false, isEmpty: true, selected: false, onClick: this.selectNode, offset: 0, maxOffset: 0 },
        { title: 'You can click anywhere on the node to drag it', isEmpty: false, selected: false, onClick: this.selectNode, offset: 0, maxOffset: 0 },
        {
          title: 'This node has dragging disabled',
          subtitle: 'Note how the hover behavior is different',
          dragDisabled: true,
          isEmpty: false,
          selected: false,
          onClick: this.selectNode,
          offset: 0,
          maxOffset: 0
        },
        { title: 'Chicken', children: [{ title: 'Egg', offset: 0, maxOffset: 1 }], isEmpty: false, selected: false, onClick: this.selectNode, offset: 0, maxOffset: 0  },
      ],
    };
    
  }

  updateTreeData(treeData) {
      debugger
    this.setState({ treeData });
  }

  expand(expanded) {
    this.setState({
      treeData: toggleExpandedForAll({
        treeData: this.state.treeData,
        expanded,
      }),
    });
  }

  //  选中
  selectNode(e, node) {
    const treeData = this.state.treeData.map(item => ({...item, selected: item.title === node.title && !item.selected}))
    this.setState({treeData})
  }

  // 处理方向键
  handleKeyDown(e) {
    const keyCode = e.which
    !this.handleUpOrDown(keyCode) && this.handleLeftOrRight(keyCode)
}

  handleUpOrDown(keyCode) {
    if (!(keyCode == 38 || keyCode == 40) ) return false
    let previousIndex = this.state.treeData.findIndex(item => item.selected)
    const minIndex = 0
    const maxIndex = this.state.treeData.length - 1
    let currentIndex = 0
    if (keyCode == 38) {
        // 上方向键
        currentIndex = previousIndex !== -1 ? previousIndex - 1 : maxIndex
    } else if (keyCode == 40) {
        // 下方向键
        currentIndex = previousIndex !== -1 ? previousIndex + 1 : minIndex
    }
    if (currentIndex > maxIndex) {
        currentIndex = maxIndex
    } else if (currentIndex < minIndex) {
        currentIndex = minIndex
    }
    const treeData = this.state.treeData.map((item, index) => ({...item, selected: index === currentIndex}))
    this.setState({treeData})
    return true
  }

  handleLeftOrRight(keyCode) {
    if (!(keyCode == 37 || keyCode == 39) ) return false
    const offset = keyCode == 37 ? -1 : 1
    const treeData = this.state.treeData.map((item, index) => {
        if (!item.selected) return item
        item.offset += offset
        if (item.offset < 0) item.offset = 0
        else if (item.offset > item.maxOffset) item.offset = item.maxOffset
        return item
    })
    this.setState({treeData})
    return true
  }

  expandAll() {
    this.expand(true);
  }

  collapseAll() {
    this.expand(false);
  }

  render() {
    const {
      treeData,
      searchString,
      searchFocusIndex,
      searchFoundCount,
    } = this.state;

    const alertNodeInfo = ({ node, path, treeIndex }) => {
      const objectString = Object.keys(node)
        .map(k => (k === 'children' ? 'children: Array' : `${k}: '${node[k]}'`))
        .join(',\n   ');

      global.alert(
        'Info passed to the icon and button generators:\n\n' +
          `node: {\n   ${objectString}\n},\n` +
          `path: [${path.join(', ')}],\n` +
          `treeIndex: ${treeIndex}`
      );
    };

    const selectPrevMatch = () =>
      this.setState({
        searchFocusIndex:
          searchFocusIndex !== null
            ? (searchFoundCount + searchFocusIndex - 1) % searchFoundCount
            : searchFoundCount - 1,
      });

    const selectNextMatch = () =>
      this.setState({
        searchFocusIndex:
          searchFocusIndex !== null
            ? (searchFocusIndex + 1) % searchFoundCount
            : 0,
      });

    return (
      <div
        style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: 'white' }}
      >
        <div style={{ flex: '0 0 auto', padding: '0 15px' }}>
          <h3>Full Node Drag Theme</h3>
          <button onClick={this.expandAll}>Expand All</button>
          <button onClick={this.collapseAll}>Collapse All</button>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <form
            style={{ display: 'inline-block' }}
            onSubmit={event => {
              event.preventDefault();
            }}
          >
            <label htmlFor="find-box">
              Search:&nbsp;
              <input
                id="find-box"
                type="text"
                value={searchString}
                onChange={event =>
                  this.setState({ searchString: event.target.value })
                }
              />
            </label>

            <button
              type="button"
              disabled={!searchFoundCount}
              onClick={selectPrevMatch}
            >
              &lt;
            </button>

            <button
              type="submit"
              disabled={!searchFoundCount}
              onClick={selectNextMatch}
            >
              &gt;
            </button>

            <span>
              &nbsp;
              {searchFoundCount > 0 ? searchFocusIndex + 1 : 0}
              &nbsp;/&nbsp;
              {searchFoundCount || 0}
            </span>
          </form>
        </div>

        <div style={{ flex: '1 0 50%', padding: '0 0 0 15px' }} tabIndex="1" onKeyDown={this.handleKeyDown}>
          <SortableTree
            theme={CustomTheme}
            treeData={treeData}
            onChange={this.updateTreeData}
            searchQuery={searchString}
            searchFocusOffset={searchFocusIndex}
            style={{width: '600px'}}
            rowHeight={45}
            searchFinishCallback={matches =>
              this.setState({
                searchFoundCount: matches.length,
                searchFocusIndex:
                  matches.length > 0 ? searchFocusIndex % matches.length : 0,
              })
            }
            canDrag={({ node }) => !node.dragDisabled}
            generateNodeProps={rowInfo => ({
              buttons: [
                <button onClick={() => alertNodeInfo(rowInfo)}>i</button>,
              ],
            })}
          />
        </div>
      </div>
    );
  }
}

export default App;
