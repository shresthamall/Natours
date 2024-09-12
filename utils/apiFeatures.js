class APIFeatures {
  //   query;
  //   queryObj;
  constructor(query, queryObj) {
    this.query = query;
    this.queryObj = queryObj;
  }
  filter() {
    // Clean up comparions operands: add '$' before them for mongo query
    this.queryObj = this._cleanQueryOperands();
    // Remove exluded keywords and mount find() onto query
    this.query = this.query.find(this._removeExcludedFields());
    return this;
  }

  sort() {
    if (this.queryObj.sort) {
      const sortBy = this.queryObj.sort.replaceAll(',', ' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }
  limitFields() {
    if (this.queryObj.fields) {
      const selectBy = this.queryObj.fields.replaceAll(',', ' ');
      console.log('selectby    ', selectBy);
      this.query = this.query.select(selectBy);
    } else {
      // If no fields specified, return all fields barring '__v'
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const { page = 1, limit = 100 } = this.queryObj;
    const skip = (page - 1) * limit;
    // console.log(typeof +page, typeof skip, typeof +limit);
    this.query = this.query.skip(skip).limit(+limit);
    return this;
  }

  getQuery() {
    return this.query;
  }
  // Remove Reserved params/keywords
  _removeExcludedFields() {
    // Reserved keywords for params
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    // Remove reserved keywords from queryObj without modifying original object
    const newQueryObj = { ...this.queryObj };
    excludedFields.forEach((ef) => delete newQueryObj[ef]);
    //   console.log('after', this.queryObj);
    return newQueryObj;
  }

  // Add '$' before each comparing operand
  // Procedure: Convert to string -> Replace 'operators' with '$operators' -> Convert to Object
  _cleanQueryOperands() {
    return JSON.parse(
      JSON.stringify(this.queryObj).replace(
        /\b(gte|gt|lt|lte)\b/g,
        (match) => `$${match}`
      )
    );
  }
}

module.exports = APIFeatures;
