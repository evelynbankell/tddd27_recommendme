import React, { Component } from 'react';
import GetGroups from './getGroups';
import AddGroup from './addGroup';
import LoginModal from './login';
import MainBox from './mainBox';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setShowComponent } from '../redux/actions/groupActions';
import { fetchOneGroup, fetchGroups, fetchAddGroup } from '../redux/fetchGroups';
import {getGroupsError, getGroupsPending, getGroups, getGroup, showComponent} from '../redux/reducers/groups';
import { getUser } from '../redux/reducers/users';

class SideBar extends Component{
  constructor(props){
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick = (show_component) => {
      const {setShowComponent} = this.props;
      setShowComponent();
  };

  render(){
    const {groups, current_group, user, show_component} = this.props;
    return (
      <React.Fragment>
        <div>
          <p className="p-2 lead"> Welcome {this.props.user.name}</p>
        </div>
          <p className="p-3 group-title" onClick={() => this.handleClick(this.props.show_component )}>CREATE NEW GROUP</p>
        <div>
          <GetGroups />
        </div>
      </React.Fragment>
    )
  }
}

const mapStateToProps = state => ({
  error: getGroupsError(state),
  groups: getGroups(state),
  user: getUser(state),
  current_group: getGroup(state),
  show_component: showComponent(state),
  pending: getGroupsPending(state)
})
const mapDispatchToProps = dispatch => bindActionCreators({
    fetchAddGroup: fetchAddGroup,
    setShowComponent: setShowComponent
}, dispatch)


export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SideBar );
