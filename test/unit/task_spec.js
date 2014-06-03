/* global describe, it, before, beforeEach */
/* jshint expr:true */

'use strict';

process.env.DBNAME = 'todo-test';

var expect = require('chai').expect;
var Mongo = require('mongodb');
var app = require('../../app/app');
var request = require('supertest');
var traceur = require('traceur');
var moment = require('moment');

var User;
var Task;
var sue;
var task;

describe('Task', function(){
  before(function(done){
    request(app)
    .get('/')
    .end(function(){
      User = traceur.require(__dirname + '/../../app/models/user.js');
      Task = traceur.require(__dirname + '/../../app/models/task.js');
      done();
    });
  });

  beforeEach(function(done){
    global.nss.db.collection('users').drop(function(){
      global.nss.db.collection('tasks').drop(function(){
        User.register({email:'sue@aol.com', password:'abcd'}, function(u){
          Task.create(u._id, {title:'homework', due:'7/17/2014', color:'orange'}, function(t){
            sue = u;
            task = t;
            done();
          });
        });
      });
    });
  });

  describe('.create', function(){
    it('should create a task - string user id', function(done){
      Task.create(sue._id.toString(), {title:'milk', due:'3/15/2012', color:'red'}, function(t){
        expect(t).to.be.instanceof(Task);
        expect(t._id).to.be.ok;
        expect(t.title).to.equal('milk');
        expect(t.due).to.be.instanceof(Date);
        expect(moment(t.due).format('MM/DD/YYYY')).to.equal('03/15/2012');
        expect(t.isComplete).to.be.false;
        expect(t.color).to.equal('red');
        expect(t.userId).to.deep.equal(sue._id);
        expect(t.userId).to.be.instanceof(Mongo.ObjectID);
        done();
      });
    });

    it('should create a task - object user id', function(done){
      Task.create(sue._id, {title:'salad', due:'4/14/2014', color:'green'}, function(t){
        expect(t).to.be.instanceof(Task);
        expect(t._id).to.be.ok;
        done();
      });
    });
  });

  describe('.findById', function(){
    it('should find a task by its id', function(done){
      Task.findById(task._id.toString(), function(t){
        expect(t).to.be.instanceof(Task);
        expect(t._id).to.deep.equal(task._id);
        done();
      });
    });

    it('should NOT find a task - BAD ID', function(done){
      Task.findById('not an id', function(t){
        expect(t).to.be.null;
        done();
      });
    });

    it('should NOT find a task - WRONG ID', function(done){
      Task.findById('538dfb6e5cc8b9f1069585b2', function(t){
        expect(t).to.be.null;
        done();
      });
    });
  });

});
