import React, { Component } from "react";
import { connect } from "react-redux";
import { getCountries } from "../actions/Country";

class Country extends Component {
  constructor(props) {
    super(props);
    this.state = {
      countries: "",
      countrySelected: ""
    };
  }

  static getDerivedStateFromProps(props, state) {
    if (state.countries === "") {
      return { countries: props.countries };
    }
    return null;
  }

  handleClick = e => {
    this.setState({
      countrySelected: e.target.value
    });
  };

  // Search Country based on search
  searchCountry = e => {
    const { countries } = this.props;
    let searchedString = [];
    const inputValue = e.target.value;
    searchedString = countries.filter(countries =>
      countries.name.toLowerCase().includes(inputValue)
    );

    if (inputValue === "") {
      searchedString = this.props.countries;
    } else {
      searchedString = searchedString.length > 0 ? searchedString : [];
    }

    this.setState({
      countries: searchedString
    });
  };

  componentDidMount() {
    const { getCountries } = this.props;
    getCountries();
  }

  render() {
    const { loading } = this.props;
    const { countries } = this.state;
    let categoryList;

    if (countries.length > 0) {
      categoryList = countries.map((category, index) => {
        return (
          <option key={category.code} value={category.name}>
            {category.name}
          </option>
        );
      });
    } else {
      categoryList = (
        <option key="0" value="No Match Found">
          No match Found
        </option>
      );
    }

    return (
      <React.Fragment>
        <input
          type="text"
          placeholder={this.state.inputCountry}
          onKeyUp={this.searchCountry}
        />
        {loading ? (
          "Loding Please Wait"
        ) : (
          <div className="row customcss">
            <div className="col-md-4"></div>
            <form className="col-md-4">
              <select
                className="form-control select2"
                onChange={this.handleClick}
              >
                <option key="select" value="Select">
                  Select
                </option>
                {categoryList}
              </select>
            </form>
          </div>
        )}

        <p className="customcss">
          Your chosen country is {this.state.countrySelected}
        </p>
      </React.Fragment>
    );
  }
}

const mapDispatchToProps = {
  getCountries
};

const mapStateToProps = state => {
  return {
    loading: state.CountrytReducer.loading,
    countries: state.CountrytReducer.countries
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Country);
