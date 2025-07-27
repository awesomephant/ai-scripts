import T from "../common/timer"

const mockOnstop = jest.fn((key, t) => {})

test("calls onstop function", (done) => {
	T.onstop = mockOnstop
	T.start("test")
	setTimeout(() => {
		T.stop("test")
		done()
		expect(mockOnstop).toHaveBeenCalled()
		expect(mockOnstop).toHaveBeenCalledWith("test", expect.closeTo(1, 1))
	}, 1000)
})
