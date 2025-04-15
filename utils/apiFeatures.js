class APIFeatures {
  //   query;
  //   queryString;
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  filter() {
    // Clean up comparions operands: add '$' before them for mongo query
    this.queryString = this._cleanQueryOperands();
    // Remove excluded keywords and mount find() onto query
    this.query = this.query.find(this._removeExcludedFields());
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.replaceAll(',', ' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }
  limitFields() {
    if (this.queryString.fields) {
      const selectBy = this.queryString.fields.replaceAll(',', ' ');
      console.log('selectby    ', selectBy);
      this.query = this.query.select(selectBy);
    } else {
      // If no fields specified, return all fields barring '__v'
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const { page = 1, limit = 100 } = this.queryString;
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
    // Remove reserved keywords from queryString without modifying original object
    const newQueryString = { ...this.queryString };
    excludedFields.forEach((ef) => delete newQueryString[ef]);
    //   console.log('after', this.queryString);
    return newQueryString;
  }

  // Add '$' before each comparing operand
  // Procedure: Convert to string -> Replace 'operators' with '$operators' -> Convert to Object
  // HTTP
  _cleanQueryOperands() {
    return JSON.parse(
      JSON.stringify(this.queryString).replace(
        /\b(gte|gt|lt|lte)\b/g,
        (match) => `$${match}`
      )
    );
  }
}

module.exports = APIFeatures;
