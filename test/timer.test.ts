import T from "../common/timer"

const mockOnstop = jest.fn()

it("calls onstop function", (done) => {
	T.onstop = mockOnstop
	T.start("test")
	setTimeout(() => {
		T.stop("test")
		done()
		expect(mockOnstop).toHaveBeenCalled()
		expect(mockOnstop).toHaveBeenCalledWith("test", expect.closeTo(1, 2))
	}, 1000)
})
