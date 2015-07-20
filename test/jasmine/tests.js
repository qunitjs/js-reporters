describe("group a", function () {
    it("foo", function () {
        expect(5).toBe(5);
        expect(1 / 0).toBe(Infinity);
    });

    describe("subgroup ", function () {
        it("subtest", function () {
            expect(true).toBeTruthy();
        });
    });

    it("bar goes wrong", function () {
        expect(5).toBe("5");
    });
});
describe("group b", function () {
    it("baz", function () {
        expect(true).toBeTruthy();
    });
});

describe("group c", function () {
    xit("skipped", function () {
        expect(true).toBeTruthy();
    });
    it ("notSkipped", function (){
        expect(42).toBe(42);
    })
});


