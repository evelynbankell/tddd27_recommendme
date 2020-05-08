import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { fetchOneGroup, fetchGroups, fetchAddGroup } from '../redux/fetchGroups';
import {getGroupsError, getGroupsPending, getGroups, getGroup} from '../redux/reducers/groups';

import {Form, FormGroup, Label, Input, Button } from 'react-bootstrap';


class GroupForm extends React.Component {
  constructor(props) {
      super(props);
      this.onFormSubmit = this.onFormSubmit.bind(this);
  }

   onFormSubmit(val) {
    this.props.handleNewGroup(this.title);
  }

  handleChangeTitle = event => {
    const { name, value } = event.target;
    this.title = value;
  }


  render() {
    const {title } = this.props;
    return (
      <Form onSubmit={this.onFormSubmit}>
        <small className="pt-4 pb-4">CREATE NEW GROUP:</small>
        <div className="row form-group pl-3">

          <div className="col-12">
            <label className="pt-2 pr-2 mb-0" name="title" type="text" label="Title">Title: </label>
            <input
            type="string"
            name="title"
            className="form-control pr-2"
            id="group-title"
            placeholder="Enter a title"
            value={title}
            onChange={this.handleChangeTitle}
            />
          </div>
          <div className="col-12 pt-2">
              <Button variant="primary" type="submit">Create</Button>
          </div>
          </div>
        </Form>
    )
  }
}


class AddGroup extends React.Component {
  constructor(props) {
      super(props);
  }

  handleNewGroup = (title) => {
    const {fetchAddGroup} = this.props;
    fetchAddGroup(title);
  };

  render() {
    return (
        <React.Fragment>
          <div>
            <GroupForm handleNewGroup={(title) =>
              {this.handleNewGroup(title)}}/>
          </div>
        </React.Fragment>
    )
  }
}

const mapStateToProps = state => ({
  groups: getGroups(state),
  current_group: getGroup(state)
})

const mapDispatchToProps = dispatch => bindActionCreators({
    fetchAddGroup: fetchAddGroup,
}, dispatch)


export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AddGroup );
