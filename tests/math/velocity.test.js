var entityFactory = require('../helpers').entityFactory;

var EPS = 1e-6;

suite('velocity', function () {
  var el,
      component;

  suite('default', function () {
    setup(function (done) {
      el = this.el = entityFactory();
      el.setAttribute('velocity', '');
      el.addEventListener('loaded', function () {
        component = el.components.velocity;
        done();
      });
    });

    test('defaults to 0 0 0', function () {
      component.update();
      expect(el.getAttribute('velocity')).to.shallowDeepEqual({x: 0, y: 0, z: 0});
    });

    test('updates position', function () {
      el.setAttribute('velocity', {x: 1, y: 2, z: 3});
      delete component.system;
      component.tick(100, 0.1);
      var position = el.object3D.position;
      expect(position.x).to.be.closeTo(0.0001, EPS);
      expect(position.y).to.be.closeTo(0.0002, EPS);
      expect(position.z).to.be.closeTo(0.0003, EPS);
    });
  });

  suite('physics', function () {
    var el,
        component,
        physics = {
          data: {maxInterval: 0.00005},
          addComponent: function () {},
          removeComponent: function () {}
        };

    setup(function (done) {
      el = this.el = entityFactory();
      el.sceneEl.systems.physics = physics;
      sinon.spy(physics, 'addComponent');
      sinon.spy(physics, 'removeComponent');
      el.setAttribute('velocity', '');
      el.addEventListener('loaded', function () {
        component = el.components.velocity;
        done();
      });
    });

    teardown(function () {
      physics.addComponent.restore();
      physics.removeComponent.restore();
    });

    test('registers with the physics system', function () {
      expect(physics.addComponent).to.have.been.calledWith(component);
    });

    test('unregisters with the physics system', function () {
      el.removeAttribute('velocity');
      expect(physics.removeComponent).to.have.been.calledWith(component);
    });

    test('defaults to 0 0 0', function () {
      component.update();
      expect(el.object3D.position).to.shallowDeepEqual({x: 0, y: 0, z: 0});
    });

    test('updates position', function () {
      el.setAttribute('velocity', {x: 1, y: 2, z: 3});
      component.tick(100, 0.1);
      expect(el.object3D.position).to.shallowDeepEqual({x: 0, y: 0, z: 0});
      component.afterStep(100, 0.1 /* overridden by maxInterval */);
      var position = el.object3D.position;
      expect(position.x).to.be.closeTo(0.00005, EPS);
      expect(position.y).to.be.closeTo(0.00010, EPS);
      expect(position.z).to.be.closeTo(0.00015, EPS);
    });
  });
});
